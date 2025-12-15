import { useEffect, useState } from "react";
import { BleCommandManager } from "./BleCommandManager";
import { TWriteCommand } from "./types";

interface TUseWrite<T> {
  onCatchError?: (v: any) => any;
  successCondition?: (v: T) => boolean;
  errorCondition?: (v: T) => boolean;
  /** Callback function called when disconnected */
  onDisconnected?: () => void;
}

/**
 * Hook for writing BLE commands with queue management
 *
 * @param props - Hook options
 * @returns Loading state and write command function
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
    // Setup disconnected callback
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
