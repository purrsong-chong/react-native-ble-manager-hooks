# react-native-ble-manager-hooks

[![npm version](https://img.shields.io/npm/v/react-native-ble-manager-hooks.svg?style=flat)](https://www.npmjs.com/package/react-native-ble-manager-hooks)
[![npm downloads](https://img.shields.io/npm/dm/react-native-ble-manager-hooks.svg?style=flat)](https://www.npmjs.com/package/react-native-ble-manager-hooks)
[![GitHub issues](https://img.shields.io/github/issues/chongs02/react-native-ble-manager-hooks.svg?style=flat)](https://github.com/chongs02/react-native-ble-manager-hooks/issues)

A React Native library providing custom hooks for [react-native-ble-manager](https://github.com/innoveit/react-native-ble-manager) with advanced BLE command management features.

## Features

- 🔄 **Command Queue Processing**: Sequential command execution to prevent concurrency issues
- 🔌 **Automatic Connection Management**: Auto-reconnection with retry mechanism (up to 3 attempts)
- 📦 **Singleton Pattern**: Centralized BLE communication management
- 🎯 **Response Matching**: Automatic command-response matching with duplicate filtering
- ⚡ **TypeScript Support**: Full type definitions for better developer experience
- 🔗 **Disconnection Detection**: Built-in BLE disconnection event handling
- 📡 **BLE State Management**: Hooks for Bluetooth state, scanning, and peripheral management
- 🎣 **React Hooks**: Custom hooks for common BLE operations

## Prerequisites

This library uses [react-native-ble-manager](https://github.com/innoveit/react-native-ble-manager) to handle Bluetooth Low Energy (BLE) operations. You must install and link `react-native-ble-manager` in your project first.

## Requirements

- React Native 0.60+
- iOS 8+ or Android (API 19+)

## Installation

```bash
npm install --save react-native-ble-manager-hooks
# or
yarn add react-native-ble-manager-hooks
```

Make sure you have installed and linked `react-native-ble-manager` in your project.

## Usage

### Hooks Overview

This library provides the following hooks:

- `useBluetoothState()` - Returns the current Bluetooth service state
- `useBleManagerInit()` - Manages BleManager initialization state
- `useBlePeripheral()` - Manages a specific BLE peripheral (device)
- `useBleScan()` - Manages the scanning process for peripherals
- `useWrite()` - Writes BLE commands with queue management

### Basic Example

```typescript
import { useWrite } from "react-native-ble-manager-hooks";

const MyComponent = () => {
  const { loading, onWriteCommand } = useWrite();

  const sendCommand = async () => {
    const [success, error] = await onWriteCommand({
      command: 0x01,
      packet: [0x00, 0x01, 0x02],
      serviceData: {
        peripheralId: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
        serviceUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
        txCharacteristicUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX", // For notifications
        rxCharacteristicUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX", // For writing
      },
      maxByteSize: 20, // Optional: default depends on device
    });

    if (error) {
      console.error("Command failed:", error);
      return;
    }

    if (success) {
      console.log("Command succeeded:", success.value);
    }
  };

  return (
    <View>
      <Button title="Send Command" onPress={sendCommand} disabled={loading} />
      {loading && <Text>Sending...</Text>}
    </View>
  );
};
```

### Advanced Example with Options

```typescript
import { useWrite } from "react-native-ble-manager-hooks";

const MyComponent = () => {
  const { loading, onWriteCommand } = useWrite({
    onDisconnected: () => {
      console.log("BLE device disconnected");
      // Handle disconnection (e.g., show alert, navigate back)
    },
    onCatchError: (error) => {
      console.error("Error occurred:", error);
      // Custom error handling
    },
    successCondition: (response) => {
      // Define custom success condition
      return response.value[0] === 0x00;
    },
    errorCondition: (response) => {
      // Define custom error condition
      return response.value[0] !== 0x00;
    },
  });

  const sendCommand = async () => {
    const [success, error] = await onWriteCommand({
      command: 0x01,
      packet: [0x00, 0x01, 0x02],
      serviceData: {
        peripheralId: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
        serviceUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
        txCharacteristicUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
        rxCharacteristicUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      },
    });

    // Handle response
    if (error) {
      // error.value contains the error response data
      handleError(error);
    } else if (success) {
      // success.value contains the success response data
      handleSuccess(success);
    }
  };

  // ... rest of component
};
```

### Bluetooth State Management

```typescript
import { useBluetoothState } from "react-native-ble-manager-hooks";
import { BleState } from "react-native-ble-manager";

const MyComponent = () => {
  const bluetoothState = useBluetoothState();

  return (
    <View>
      <Text>
        Bluetooth State: {bluetoothState === BleState.On ? "On" : "Off"}
      </Text>
    </View>
  );
};
```

### BleManager Initialization

```typescript
import { useBleManagerInit } from "react-native-ble-manager-hooks";
import BleManager from "react-native-ble-manager";

const MyComponent = () => {
  const { isInitialized, isInitializing, initError, initialize } =
    useBleManagerInit({
      autoInit: true, // Automatically initialize on mount
      initOptions: { showAlert: false },
    });

  useEffect(() => {
    if (isInitialized) {
      // BleManager is ready, you can now use other hooks
      console.log("BleManager initialized");
    }
  }, [isInitialized]);

  // Or manually initialize
  const handleInit = async () => {
    await initialize();
  };

  return (
    <View>
      {isInitializing && <Text>Initializing...</Text>}
      {initError && <Text>Error: {initError.message}</Text>}
      {!isInitialized && <Button title="Initialize" onPress={handleInit} />}
    </View>
  );
};
```

### Peripheral Scanning

```typescript
import { useBleScan } from "react-native-ble-manager-hooks";

const ScanComponent = () => {
  const {
    isScanning,
    peripherals,
    error,
    startScan,
    stopScan,
    clearPeripherals,
  } = useBleScan({
    serviceUUIDs: ["XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"], // Optional
    scanTimeLimit: 10000, // 10 seconds
    allowDuplicates: false,
    onPeripheralFound: (peripheral) => {
      console.log("Found peripheral:", peripheral.name);
    },
    onScanStarted: () => {
      console.log("Scan started");
    },
    onScanStopped: () => {
      console.log("Scan stopped");
    },
  });

  return (
    <View>
      <Button
        title={isScanning ? "Stop Scan" : "Start Scan"}
        onPress={isScanning ? stopScan : startScan}
      />
      {peripherals.map((peripheral) => (
        <Text key={peripheral.id}>
          {peripheral.name || "Unknown"} - {peripheral.id}
        </Text>
      ))}
    </View>
  );
};
```

### Peripheral Management

```typescript
import { useBlePeripheral } from "react-native-ble-manager-hooks";

const PeripheralComponent = () => {
  const peripheralId = "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX";
  const {
    connectionState,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    retrieveServices,
    startNotification,
    stopNotification,
  } = useBlePeripheral(peripheralId, {
    onConnected: () => {
      console.log("Connected!");
    },
    onDisconnected: () => {
      console.log("Disconnected!");
    },
    onConnectionFailed: (error) => {
      console.error("Connection failed:", error);
    },
  });

  const handleConnect = async () => {
    await connect();
    const services = await retrieveServices();
    if (services) {
      // Start notification for a characteristic
      await startNotification("SERVICE-UUID", "CHARACTERISTIC-UUID");
    }
  };

  return (
    <View>
      <Text>State: {connectionState}</Text>
      {error && <Text>Error: {error.message}</Text>}
      <Button
        title={isConnected ? "Disconnect" : "Connect"}
        onPress={isConnected ? disconnect : handleConnect}
        disabled={isConnecting}
      />
    </View>
  );
};
```

### Multiple Sequential Commands

The library automatically handles sequential command execution through the command queue. Commands are processed one at a time to prevent conflicts.

```typescript
const sendMultipleCommands = async () => {
  // These commands will be executed sequentially
  const [result1] = await onWriteCommand({
    command: 0x01,
    packet: [0x00, 0x01],
    serviceData: {
      peripheralId: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      serviceUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      txCharacteristicUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      rxCharacteristicUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    },
  });
  const [result2] = await onWriteCommand({
    command: 0x02,
    packet: [0x00, 0x02],
    serviceData: {
      peripheralId: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      serviceUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      txCharacteristicUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      rxCharacteristicUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    },
  });
};
```

## API Reference

### `useBluetoothState()`

Returns the current Bluetooth service state.

#### Returns

- `BleState` - Current Bluetooth state (`Unknown`, `Resetting`, `Unsupported`, `Unauthorized`, `On`, `Off`, `TurningOn`, `TurningOff`)

#### Example

```typescript
const state = useBluetoothState();
// state will be one of: BleState.Unknown, BleState.On, BleState.Off, etc.
```

---

### `useBleManagerInit(options?)`

Manages BleManager initialization state.

#### Parameters

- `options?` (optional): Configuration object
  - `autoInit?: boolean` - Whether to auto-initialize on mount (default: false)
  - `initOptions?: StartOptions` - Initialization options (see [react-native-ble-manager docs](https://innoveit.github.io/react-native-ble-manager/methods/#start))

#### Returns

- `isInitialized: boolean` - Whether BleManager is initialized
- `isInitializing: boolean` - Whether initialization is in progress
- `initError: any` - Initialization error if any
- `initialize: () => Promise<void>` - Function to manually initialize

---

### `useBleScan(options?)`

Manages BLE peripheral scanning process.

#### Parameters

- `options?` (optional): Configuration object
  - `serviceUUIDs?: string[]` - Array of service UUIDs to scan for
  - `scanTimeLimit?: number` - Scan time limit in milliseconds
  - `allowDuplicates?: boolean` - Whether to allow duplicate peripherals (default: true)
  - `onPeripheralFound?: (peripheral: Peripheral) => void` - Callback when peripheral is found
  - `onScanStarted?: () => void` - Callback when scan starts
  - `onScanStopped?: () => void` - Callback when scan stops

#### Returns

- `isScanning: boolean` - Whether scanning is in progress
- `peripherals: Peripheral[]` - Array of discovered peripherals
- `peripheralsMap: Map<string, Peripheral>` - Map of discovered peripherals by ID
- `error: any` - Scan error if any
- `startScan: () => Promise<void>` - Function to start scanning
- `stopScan: () => Promise<void>` - Function to stop scanning
- `clearPeripherals: () => void` - Function to clear discovered peripherals list

---

### `useBlePeripheral(peripheralId?, options?)`

Manages a specific BLE peripheral (device).

#### Parameters

- `peripheralId?: string` - ID of the peripheral to manage
- `options?` (optional): Configuration object
  - `onDisconnected?: () => void` - Callback when disconnected
  - `onConnected?: () => void` - Callback when connection succeeds
  - `onConnectionFailed?: (error: any) => void` - Callback when connection fails

#### Returns

- `peripheralId: string | undefined` - The peripheral ID
- `connectionState: PeripheralConnectionState` - Connection state (`disconnected`, `connecting`, `connected`, `disconnecting`)
- `isConnected: boolean` - Whether peripheral is connected
- `isConnecting: boolean` - Whether connection is in progress
- `isDisconnecting: boolean` - Whether disconnection is in progress
- `error: any` - Error if any
- `connect: () => Promise<void>` - Function to connect to peripheral
- `disconnect: () => Promise<void>` - Function to disconnect from peripheral
- `checkConnection: () => Promise<boolean>` - Function to check connection status
- `retrieveServices: () => Promise<any>` - Function to retrieve services
- `startNotification: (serviceUUID: string, characteristicUUID: string) => Promise<boolean>` - Function to start notification
- `stopNotification: (serviceUUID: string, characteristicUUID: string) => Promise<boolean>` - Function to stop notification

---

### `useWrite<T>(options?)`

A React hook that provides BLE command writing functionality with loading state and error handling.

#### Parameters

- `options?` (optional): Configuration object
  - `onDisconnected?: () => void` - Callback invoked when BLE device disconnects
  - `onCatchError?: (error: any) => any` - Error handler for command execution errors
  - `successCondition?: (response: T) => boolean` - Custom condition to determine success
  - `errorCondition?: (response: T) => boolean` - Custom condition to determine error

#### Returns

- `loading: boolean` - Loading state of the current command
- `onWriteCommand: (params: TWriteCommand) => Promise<[THandleUpdateValueForCharacteristicValue | undefined, THandleUpdateValueForCharacteristicValue | undefined]>` - Function to send BLE commands

### `TWriteCommand`

Command parameters interface:

```typescript
interface TWriteCommand {
  command: number; // Command identifier
  packet: number[]; // Data packet to send
  serviceData: TServiceInfo; // BLE service information
  maxByteSize?: number; // Optional: Maximum byte size per write
}
```

### `TServiceInfo`

Service information interface:

```typescript
interface TServiceInfo {
  peripheralId: string; // BLE device ID
  serviceUUID: string; // Service UUID
  txCharacteristicUUID: string; // Characteristic UUID for receiving notifications
  rxCharacteristicUUID: string; // Characteristic UUID for writing commands
}
```

### Response Format

The `onWriteCommand` function returns a tuple:

```typescript
[
  success: THandleUpdateValueForCharacteristicValue | undefined,
  error: THandleUpdateValueForCharacteristicValue | undefined
]
```

- **First element**: Success response (undefined if command failed)
- **Second element**: Error response (undefined if command succeeded)
- **Both undefined**: Command was cancelled or no response received

The response object structure:

```typescript
interface THandleUpdateValueForCharacteristicValue {
  value: number[]; // Response data as byte array
  peripheral: string; // Peripheral ID
  characteristic: string; // Characteristic UUID
  service: string; // Service UUID
}
```

## How It Works

1. **Command Queue**: Commands are queued and processed sequentially to prevent race conditions
2. **Connection Management**: The library automatically checks connection status and reconnects if needed (up to 3 retries)
3. **Response Matching**: Responses are matched with commands using packet identifiers to filter duplicates
4. **Error Handling**: Comprehensive error handling with automatic retries for connection failures
5. **Auto Cleanup**: Resources are automatically cleaned up when the component unmounts

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/chongs02/react-native-ble-manager-hooks/issues) page.
