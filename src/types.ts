export type TServiceInfo = {
  peripheralId: string;
  serviceUUID: string;
  txCharacteristicUUID: string;
  rxCharacteristicUUID: string;
};
/**
 * BLE 통신 관리를 위한 타입 정의
 */
export interface THandleUpdateValueForCharacteristicValue {
  value: number[];
  peripheral: string;
  characteristic: string;
  service: string;
}
export interface TWriteCommand {
  command: number;
  packet: number[];
  serviceData: TServiceInfo;
  maxByteSize?: number;
}
