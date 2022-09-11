import { useEffect, useRef } from "react";
import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
} from "react-native";
import BleManager from "react-native-ble-manager";
import { sleep } from "./utils/sleep";
import { useSwitchState } from "./utils/useSwitchState";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

interface TWriteParams {
  peripheralID: string;
  serviceUUID: string;
  characteristicUUID: string;
  data: any;
  maxByteSize?: number | undefined;
  onCatchError?: (v: any) => any;
  delay?: number;
}

interface TUseWrite<T> {
  onCatchError?: (v: any) => any;
  successCondition?: (v: T) => boolean;
  errorCondition?: (v: T) => boolean;
}

/**
 *
 * useWriteState
 *
 *
 * @param props
 * @returns
 */
export const useWrite = <T extends unknown>(props?: TUseWrite<T>) => {
  const [loading, setLoading] = useSwitchState();

  // flag to avoid multiple request one time (one request for one moment)
  const writeSuccessRef = useRef(true);

  // ref for ble manager listener
  const handlerUpdate = useRef<EmitterSubscription>();

  // buffer to store result of ble command
  const responseBuffer = useRef<T>();
  // buffer to store error result of ble command
  const commandErrorBuffer = useRef<T>();

  const onWriteCommand = async ({
    peripheralID,
    serviceUUID,
    characteristicUUID,
    data,
    maxByteSize,
    onCatchError,
    delay,
  }: TWriteParams): Promise<[T | undefined, T | undefined]> => {
    setLoading(true);

    //initializeBuffer
    responseBuffer.current = undefined;
    commandErrorBuffer.current = undefined;

    try {
      // delay
      await sleep(delay ? delay : 100);

      writeSuccessRef.current = false;

      await BleManager.write(
        peripheralID,
        serviceUUID,
        characteristicUUID,
        data,
        maxByteSize
      );
      writeSuccessRef.current = true;

      //wait fot getting result or error result of ble command ( from device )
      while (!responseBuffer.current && !commandErrorBuffer.current) {
        await sleep(100);
      }
    } catch (e: any) {
      if (props?.onCatchError) {
        props.onCatchError(e);
      } else {
        if (onCatchError) {
          onCatchError(e);
        }
      }
    } finally {
      setLoading(false);
      return [responseBuffer.current, commandErrorBuffer.current];
    }
  };

  const handleUpdateValueForCharacteristic = (response: T) => {
    if (props?.errorCondition) {
      const isError = props.errorCondition(response);
      if (isError) {
        commandErrorBuffer.current = response;
      }
    }

    if (props?.successCondition) {
      const isSuccess = props.successCondition(response);
      if (isSuccess) {
        return (responseBuffer.current = response);
      }
      return (responseBuffer.current = undefined);
    } else {
      return (responseBuffer.current = response);
    }
  };

  useEffect(() => {
    handlerUpdate.current = bleManagerEmitter.addListener(
      "BleManagerDidUpdateValueForCharacteristic",
      handleUpdateValueForCharacteristic
    );

    return () => {
      if (handlerUpdate.current) {
        handlerUpdate.current.remove();
      }
    };
  }, []);

  return {
    loading,
    onWriteCommand,
  };
};
