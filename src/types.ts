export type TServiceInfo = {
  peripheralId: string;
  serviceUUID: string;
  txCharacteristicUUID: string;
  rxCharacteristicUUID: string;
};
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

/**
 * BLE Peripheral connection state
 */
export type PeripheralConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting";
