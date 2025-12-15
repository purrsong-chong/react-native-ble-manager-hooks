import { useEffect, useState } from "react";
import BleManager, { BleState } from "react-native-ble-manager";

/**
 * Hook that returns the Bluetooth service state
 * @returns Current Bluetooth state (e.g., "PoweredOn", "PoweredOff", "Unknown")
 */
export const useBluetoothState = (): BleState => {
  const [state, setState] = useState<BleState>(BleState.Unknown);

  useEffect(() => {
    // Get initial state
    const getInitialState = async () => {
      try {
        const initialState = await BleManager.checkState();
        setState(initialState);
      } catch (error) {
        console.error("Failed to get initial Bluetooth state:", error);
        setState(BleState.Unknown);
      }
    };

    getInitialState();

    // Setup state change listener
    const listener = BleManager.onDidUpdateState((newState: string) => {
      setState(newState as BleState);
    });

    return () => {
      if (listener) {
        listener.remove();
      }
      // Cleanup listener (react-native-ble-manager may not provide removeListener)
      // Add appropriate cleanup logic if needed
    };
  }, []);

  return state;
};
