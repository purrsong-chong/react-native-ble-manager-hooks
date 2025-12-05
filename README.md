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
