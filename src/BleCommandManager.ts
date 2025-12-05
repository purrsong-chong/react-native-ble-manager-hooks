import BleManager from "react-native-ble-manager";
import {
  THandleUpdateValueForCharacteristicValue,
  TServiceInfo,
  TWriteCommand,
} from "./types";
/**
 * BLE 명령어 관리자 클래스
 * 싱글톤 패턴을 사용하여 BLE 통신을 중앙 집중화하고 명령어 실행을 순차적으로 관리합니다.
 */
export class BleCommandManager {
  private static instance: BleCommandManager;
  private onDisconnectedCallback?: () => void;
  /** 실행 대기 중인 명령어 큐 */
  private commandQueue: Array<{
    command: number;
    packet: number[];
    serviceData: TServiceInfo;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private isProcessing = false;
  private writedPacket?: number[];
  private responseRef?: THandleUpdateValueForCharacteristicValue;
  private abortController?: AbortController;
  private connectionRetryCount = 0;
  private readonly MAX_CONNECTION_RETRIES = 3;

  private constructor() {
    this.setupBleListener();
    this.setupDisconnectListener();
  }

  // 연결 해제 콜백 설정 메서드 추가
  public setDisconnectedCallback(callback?: () => void) {
    this.onDisconnectedCallback = callback;
  }
  /**
   * BleCommandManager의 싱글톤 인스턴스를 반환합니다.
   */
  public static getInstance(): BleCommandManager {
    if (!BleCommandManager.instance) {
      BleCommandManager.instance = new BleCommandManager();
    }
    return BleCommandManager.instance;
  }

  // 연결 해제 리스너 설정
  private setupDisconnectListener() {
    BleManager.onDisconnectPeripheral((event: any) => {
      console.log("Disconnected from device:", event);
      if (this.onDisconnectedCallback) {
        this.onDisconnectedCallback();
      }
    });
  }
  /**
   * BLE 특성값 업데이트 리스너를 설정합니다.
   * 중복 응답을 필터링하고 명령어에 대한 응답을 매칭합니다.
   */
  private setupBleListener() {
    BleManager.onDidUpdateValueForCharacteristic((data: any) => {
      console.log("response: ", data.value);

      if (data.value[0] === this.writedPacket?.[0]) {
        console.log("Matching response found, updating responseRef");
        this.responseRef = data;
      } else {
        console.log("Response does not match current command");
        console.log("writedPacket", this.writedPacket);
      }
    });
  }

  /**
   * BLE 연결 상태를 확인하고 필요한 경우 재연결을 시도합니다.
   * @param serviceData - BLE 서비스 정보
   * @returns 연결 성공 여부
   */
  private async ensureConnection(serviceData: TServiceInfo): Promise<boolean> {
    try {
      console.log("Checking connection status...", serviceData.peripheralId);
      const isConnected = await BleManager.isPeripheralConnected(
        serviceData.peripheralId,
        [serviceData.serviceUUID]
      );

      if (!isConnected) {
        console.log("Device not connected, attempting to connect...");
        await BleManager.connect(serviceData.peripheralId);
      }

      console.log("Retrieving services...");
      await BleManager.retrieveServices(serviceData.peripheralId);

      await BleManager.startNotification(
        serviceData.peripheralId,
        serviceData.serviceUUID,
        serviceData.txCharacteristicUUID
      );

      return true;
    } catch (error) {
      console.log("Connection ensure failed:", error);
      return false;
    }
  }

  /**
   * 명령어 큐를 처리합니다.
   * 큐에 있는 명령어를 순차적으로 실행하고 결과를 처리합니다.
   */
  private async processQueue() {
    if (this.isProcessing || this.commandQueue.length === 0) return;

    this.isProcessing = true;
    const currentCommand = this.commandQueue[0];

    try {
      const result = await this.executeCommand(currentCommand);
      currentCommand.resolve(result);
    } catch (error) {
      currentCommand.reject(error);
    } finally {
      this.commandQueue.shift();
      this.isProcessing = false;
      this.processQueue();
    }
  }

  /**
   * 단일 BLE 명령어를 실행합니다.
   * @param command - 실행할 명령어 정보
   * @returns 명령어 실행 결과
   */
  private async executeCommand({
    command,
    maxByteSize,
    serviceData,
    packet,
  }: TWriteCommand): Promise<
    [
      THandleUpdateValueForCharacteristicValue | undefined,
      THandleUpdateValueForCharacteristicValue | undefined
    ]
  > {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    try {
      const isConnected = await this.ensureConnection(serviceData);
      if (!isConnected) {
        if (this.connectionRetryCount < this.MAX_CONNECTION_RETRIES) {
          console.log(
            `Connection retry ${this.connectionRetryCount + 1}/${
              this.MAX_CONNECTION_RETRIES
            }`
          );
          this.connectionRetryCount++;
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return this.executeCommand({
            command,
            maxByteSize,
            serviceData,
            packet,
          });
        }
        throw new Error(
          "Failed to establish BLE connection after maximum retries"
        );
      }

      this.connectionRetryCount = 0;

      this.writedPacket = packet;
      this.responseRef = undefined;

      console.log("Sending command:", {
        packet,
        command,
        writedPacket: this.writedPacket,
      });

      if (this.abortController.signal.aborted) {
        throw new Error("Operation cancelled");
      }

      await BleManager.write(
        serviceData.peripheralId,
        serviceData.serviceUUID,
        serviceData.rxCharacteristicUUID,
        packet,
        maxByteSize
      );

      const response =
        await new Promise<THandleUpdateValueForCharacteristicValue>(
          (resolve, reject) => {
            const checkResponse = () => {
              if (this.abortController?.signal.aborted) {
                reject(new Error("Operation cancelled"));
                return;
              }

              if (this.responseRef) {
                resolve(this.responseRef);
              } else {
                const timeoutId = setTimeout(checkResponse, 100);
                this.abortController?.signal.addEventListener("abort", () => {
                  clearTimeout(timeoutId);
                });
              }
            };

            checkResponse();

            const timeoutId = setTimeout(() => {
              if (!this.abortController?.signal.aborted) {
                reject(new Error("Response timeout"));
              }
            }, 10000);

            this.abortController?.signal.addEventListener("abort", () => {
              clearTimeout(timeoutId);
            });
          }
        );

      if (response.value[0] === 0) {
        return [undefined, response];
      } else {
        return [response, undefined];
      }
    } catch (e: any) {
      if (e.message === "Operation cancelled") {
        console.log("Command cancelled");
        return [undefined, undefined];
      }
      throw e;
    }
  }

  /**
   * BLE 명령어를 큐에 추가하고 실행을 요청합니다.
   * @param params - 실행할 명령어 파라미터
   * @returns Promise<[성공 응답, 에러 응답]>
   */
  public async writeCommand(
    params: TWriteCommand
  ): Promise<
    [
      THandleUpdateValueForCharacteristicValue | undefined,
      THandleUpdateValueForCharacteristicValue | undefined
    ]
  > {
    return new Promise((resolve, reject) => {
      this.commandQueue.push({
        ...params,
        resolve,
        reject,
      });
      this.processQueue();
    });
  }

  /**
   * 리소스를 정리하고 진행 중인 작업을 중단합니다.
   */
  public cleanup() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}
