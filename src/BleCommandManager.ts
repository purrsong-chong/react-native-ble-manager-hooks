import BleManager from "react-native-ble-manager";
import {
  THandleUpdateValueForCharacteristicValue,
  TServiceInfo,
  TWriteCommand,
} from "./types";
/**
 * BLE command manager class
 * Uses singleton pattern to centralize BLE communication and manage command execution sequentially.
 */
export class BleCommandManager {
  private static instance: BleCommandManager;
  private onDisconnectedCallback?: () => void;
  /** Command queue waiting to be executed */
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

  // Method to set disconnected callback
  public setDisconnectedCallback(callback?: () => void) {
    this.onDisconnectedCallback = callback;
  }
  /**
   * Returns the singleton instance of BleCommandManager.
   */
  public static getInstance(): BleCommandManager {
    if (!BleCommandManager.instance) {
      BleCommandManager.instance = new BleCommandManager();
    }
    return BleCommandManager.instance;
  }

  // Setup disconnect listener
  private setupDisconnectListener() {
    BleManager.onDisconnectPeripheral((event: any) => {
      console.log("Disconnected from device:", event);
      if (this.onDisconnectedCallback) {
        this.onDisconnectedCallback();
      }
    });
  }
  /**
   * Sets up BLE characteristic value update listener.
   * Filters duplicate responses and matches responses to commands.
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
   * Checks BLE connection status and attempts to reconnect if necessary.
   * @param serviceData - BLE service information
   * @returns Connection success status
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
   * Processes the command queue.
   * Executes commands in the queue sequentially and handles results.
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
   * Executes a single BLE command.
   * @param command - Command information to execute
   * @returns Command execution result
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
   * Adds a BLE command to the queue and requests execution.
   * @param params - Command parameters to execute
   * @returns Promise<[success response, error response]>
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
   * Cleans up resources and cancels ongoing operations.
   */
  public cleanup() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}
