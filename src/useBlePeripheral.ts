import { useEffect, useState, useCallback } from "react";
import BleManager from "react-native-ble-manager";
import { PeripheralConnectionState } from "./types";

interface TUseBlePeripheralOptions {
  /** Callback function called when disconnected */
  onDisconnected?: () => void;
  /** Callback function called when connection succeeds */
  onConnected?: () => void;
  /** Callback function called when connection fails */
  onConnectionFailed?: (error: any) => void;
}

/**
 * Hook for managing a specific BLE peripheral (device)
 * @param peripheralId - ID of the peripheral to manage
 * @param options - Options configuration
 * @returns Peripheral info, connection state, connect/disconnect functions
 */
export const useBlePeripheral = (
  peripheralId?: string,
  options?: TUseBlePeripheralOptions
) => {
  const [connectionState, setConnectionState] =
    useState<PeripheralConnectionState>("disconnected");
  const [error, setError] = useState<any>(null);

  // Check connection status
  const checkConnection = useCallback(async () => {
    if (!peripheralId) return false;

    try {
      const isConnected = await BleManager.isPeripheralConnected(
        peripheralId,
        []
      );
      setConnectionState(isConnected ? "connected" : "disconnected");
      return isConnected;
    } catch (err) {
      console.error("Failed to check connection:", err);
      setError(err);
      return false;
    }
  }, [peripheralId]);

  // Connect
  const connect = useCallback(async () => {
    if (!peripheralId) {
      setError(new Error("Peripheral ID is required"));
      return;
    }

    try {
      setConnectionState("connecting");
      await BleManager.connect(peripheralId);
      setError(null);
      options?.onConnected?.();
    } catch (err) {
      console.error("Connection failed:", err);
      setError(err);
      setConnectionState("disconnected");
      options?.onConnectionFailed?.(err);
    }
  }, [peripheralId, options]);

  // Disconnect
  const disconnect = useCallback(async () => {
    if (!peripheralId) return;

    try {
      setConnectionState("disconnecting");
      await BleManager.disconnect(peripheralId);
      setError(null); // Clear error on successful disconnect
    } catch (err) {
      console.error("Disconnection failed:", err);
      setError(err);
      // Check actual connection status instead of assuming disconnected
      await checkConnection();
    }
  }, [peripheralId, checkConnection]);

  // Retrieve services
  const retrieveServices = useCallback(async () => {
    if (!peripheralId) {
      setError(new Error("Peripheral ID is required"));
      return null;
    }

    try {
      const services = await BleManager.retrieveServices(peripheralId);
      return services;
    } catch (err) {
      console.error("Failed to retrieve services:", err);
      setError(err);
      return null;
    }
  }, [peripheralId]);

  // Start notification
  const startNotification = useCallback(
    async (
      serviceUUID: string,
      characteristicUUID: string
    ): Promise<boolean> => {
      if (!peripheralId) {
        setError(new Error("Peripheral ID is required"));
        return false;
      }

      try {
        await BleManager.startNotification(
          peripheralId,
          serviceUUID,
          characteristicUUID
        );
        return true;
      } catch (err) {
        console.error("Failed to start notification:", err);
        setError(err);
        return false;
      }
    },
    [peripheralId]
  );

  // Stop notification
  const stopNotification = useCallback(
    async (
      serviceUUID: string,
      characteristicUUID: string
    ): Promise<boolean> => {
      if (!peripheralId) {
        setError(new Error("Peripheral ID is required"));
        return false;
      }

      try {
        await BleManager.stopNotification(
          peripheralId,
          serviceUUID,
          characteristicUUID
        );
        return true;
      } catch (err) {
        console.error("Failed to stop notification:", err);
        setError(err);
        return false;
      }
    },
    [peripheralId]
  );

  useEffect(() => {
    if (!peripheralId) {
      setConnectionState("disconnected");
      return;
    }

    // Check initial connection status
    checkConnection();

    // Setup connect listener
    const connectListener = BleManager.onConnectPeripheral((event: any) => {
      if (event.peripheral === peripheralId) {
        setConnectionState("connected");
        setError(null);
        options?.onConnected?.();
      }
    });

    // Setup disconnect listener
    const disconnectListener = BleManager.onDisconnectPeripheral(
      (event: any) => {
        if (event.id === peripheralId || event.peripheral === peripheralId) {
          setConnectionState("disconnected");
          options?.onDisconnected?.();
        }
      }
    );

    return () => {
      // Cleanup listeners
      if (connectListener) {
        connectListener.remove();
      }
      if (disconnectListener) {
        disconnectListener.remove();
      }
    };
  }, [peripheralId, checkConnection, options]);

  return {
    peripheralId,
    connectionState,
    isConnected: connectionState === "connected",
    isConnecting: connectionState === "connecting",
    isDisconnecting: connectionState === "disconnecting",
    error,
    connect,
    disconnect,
    checkConnection,
    retrieveServices,
    startNotification,
    stopNotification,
  };
};
