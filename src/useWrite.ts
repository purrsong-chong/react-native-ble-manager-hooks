import { useEffect, useState } from "react";
import { BleCommandManager } from "./BleCommandManager";
import { TWriteCommand } from "./types";

interface TUseWrite<T> {
  onCatchError?: (v: any) => any;
  successCondition?: (v: T) => boolean;
  errorCondition?: (v: T) => boolean;
  /** 연결 해제 시 호출될 콜백 함수 */
  onDisconnected?: () => void;
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
  const [loading, setLoading] = useState(false);
  const bleManager = BleCommandManager.getInstance();
  const onWriteCommand = async (params: TWriteCommand) => {
    setLoading(true);
    try {
      const result = await bleManager.writeCommand(params);
      return result;
    } catch (e: any) {
      console.log("e", e);
      if (props?.onCatchError) {
        props.onCatchError(e);
      } else {
        console.log(
          "e",
          typeof e.message === "string" ? e.message : JSON.stringify(e)
        );
      }
      return [undefined, undefined];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 연결 해제 콜백 설정
    bleManager.setDisconnectedCallback(props?.onDisconnected);
    return () => {
      bleManager.setDisconnectedCallback(undefined);
      bleManager.cleanup();
    };
  }, []);

  return {
    loading,
    onWriteCommand,
  };
};
