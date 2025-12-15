import { useEffect, useState, useCallback } from "react";
import BleManager, { StartOptions } from "react-native-ble-manager";

interface TUseBleManagerOptions {
  /** Whether to auto-initialize (default: false) */
  autoInit?: boolean;
  /** Initialization options */
  initOptions?: StartOptions;
}

/**
 * Hook for managing BleManager initialization state
 *
 * You can directly import and use BleManager methods,
 * this hook only manages initialization state.
 *
 * Official docs: https://innoveit.github.io/react-native-ble-manager/methods/
 *
 * @param options - Hook options
 * @returns Initialization state and initialization function
 */
export const useBleManagerInit = (options?: TUseBleManagerOptions) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<any>(null);

  // Check initialization status
  useEffect(() => {
    const checkInitialized = async () => {
      try {
        const started = await BleManager.isStarted();
        setIsInitialized(started);
      } catch (error) {
        console.error("Failed to check initialization status:", error);
        setIsInitialized(false);
      }
    };

    checkInitialized();
  }, []);

  // Auto-initialize
  useEffect(() => {
    if (options?.autoInit && !isInitialized && !isInitializing) {
      initialize();
    }
  }, [options?.autoInit, isInitialized, isInitializing]);

  // Initialize function
  const initialize = useCallback(async () => {
    if (isInitialized || isInitializing) return;

    // Check if already started to prevent duplicate initialization
    try {
      const alreadyStarted = await BleManager.isStarted();
      if (alreadyStarted) {
        setIsInitialized(true);
        return;
      }
    } catch (error) {
      // If check fails, proceed with initialization
      console.warn("Failed to check if BleManager is started:", error);
    }

    setIsInitializing(true);
    setInitError(null);

    try {
      await BleManager.start(options?.initOptions);
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize BleManager:", error);
      setInitError(error);
      setIsInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitialized, isInitializing, options?.initOptions]);

  return {
    isInitialized,
    isInitializing,
    initError,
    initialize,
  };
};
