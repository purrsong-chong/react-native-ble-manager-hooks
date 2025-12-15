import { useEffect, useState, useCallback, useRef } from "react";
import BleManager, { ScanOptions } from "react-native-ble-manager";
import { TPeripheralInfo } from "./types";

interface TUseBleScanOptions {
  /** Array of service UUIDs to scan for (optional) */
  serviceUUIDs?: string[];
  /** Scan time limit in milliseconds (default: unlimited) */
  scanTimeLimit?: number;
  /** Whether to allow duplicate peripherals (default: true) */
  allowDuplicates?: boolean;
  /** Callback function called when a peripheral is found */
  onPeripheralFound?: (peripheral: TPeripheralInfo) => void;
  /** Callback function called when scan starts */
  onScanStarted?: () => void;
  /** Callback function called when scan stops */
  onScanStopped?: () => void;
}

/**
 * Hook for managing BLE peripheral scanning process
 * @param options - Scan options configuration
 * @returns Scan state, discovered peripheral list, start/stop scan functions
 */
export const useBleScan = (options?: TUseBleScanOptions) => {
  const [isScanning, setIsScanning] = useState(false);
  const [peripherals, setPeripherals] = useState<Map<string, TPeripheralInfo>>(
    new Map()
  );
  const [error, setError] = useState<any>(null);
  const discoverListenerRef = useRef<any>(null);
  const stopScanListenerRef = useRef<any>(null);

  // Add/update peripheral
  const addPeripheral = useCallback(
    (peripheral: TPeripheralInfo) => {
      setPeripherals((prev) => {
        const newMap = new Map(prev);
        newMap.set(peripheral.id, peripheral);
        return newMap;
      });
      options?.onPeripheralFound?.(peripheral);
    },
    [options]
  );

  // Start scan
  const startScan = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Remove existing listener if present
      if (discoverListenerRef.current) {
        // react-native-ble-manager may not directly support listener removal
        // Setting a new listener will override the previous one
        discoverListenerRef.current.remove();
        discoverListenerRef.current = null;
      }

      // Setup peripheral discovery listener
      discoverListenerRef.current = BleManager.onDiscoverPeripheral(
        (peripheral: any) => {
          const peripheralInfo: TPeripheralInfo = {
            id: peripheral.id,
            name: peripheral.name,
            rssi: peripheral.rssi,
            advertising: peripheral.advertising,
          };
          addPeripheral(peripheralInfo);
        }
      );

      // Setup stop scan listener (for automatic scan stop)
      stopScanListenerRef.current = BleManager.onStopScan((status: number) => {
        setIsScanning(false);
        options?.onScanStopped?.();
      });

      // Start scan (use scan method according to official docs)
      const scanningOptions: ScanOptions = {
        serviceUUIDs: options?.serviceUUIDs || [],
        allowDuplicates: options?.allowDuplicates !== false,
      };

      // Add seconds option if scan time limit is set
      if (options?.scanTimeLimit) {
        scanningOptions.seconds = Math.ceil(options.scanTimeLimit / 1000);
      }

      await BleManager.scan(scanningOptions);

      options?.onScanStarted?.();
    } catch (err) {
      console.error("Failed to start scan:", err);
      setError(err);
      setIsScanning(false);
    }
  }, [options, addPeripheral]);

  // Stop scan
  const stopScan = useCallback(async () => {
    try {
      await BleManager.stopScan();
      setIsScanning(false);
      options?.onScanStopped?.();
    } catch (err) {
      console.error("Failed to stop scan:", err);
      setError(err);
    }
  }, [options]);

  // Clear discovered peripheral list
  const clearPeripherals = useCallback(() => {
    setPeripherals(new Map());
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScan();
      }
      if (discoverListenerRef.current) {
        discoverListenerRef.current.remove();
        discoverListenerRef.current = null;
      }
      if (stopScanListenerRef.current) {
        stopScanListenerRef.current.remove();
        stopScanListenerRef.current = null;
      }
    };
  }, [isScanning, stopScan]);

  return {
    isScanning,
    peripherals: Array.from(peripherals.values()),
    peripheralsMap: peripherals,
    error,
    startScan,
    stopScan,
    clearPeripherals,
  };
};
