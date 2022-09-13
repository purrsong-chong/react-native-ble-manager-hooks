# react-native-ble-manager-hooks

[![npm version](https://img.shields.io/npm/v/react-native-ble-manager-hooks.svg?style=flat)](https://www.npmjs.com/package/react-native-ble-manager-hooks)
[![npm downloads](https://img.shields.io/npm/dm/react-native-ble-manager-hooks.svg?style=flat)](https://www.npmjs.com/package/react-native-ble-manager-hooks)
[![GitHub issues](https://img.shields.io/github/issues/chongs02/react-native-ble-manager-hooks.svg?style=flat)](https://github.com/chongs02/react-native-ble-manager-hooks/issues)

This is custom hooks packages of https://github.com/innoveit/react-native-ble-manager project.

## Prerequisites

This library uses [react-native-ble-manager](https://github.com/innoveit/react-native-ble-manager) to use bluetooth functions. Therefore this library needs to be installed AND linked into your project to work.

## Requirements

RN 0.60+

## Supported Platforms

- iOS 8+
- Android (API 19+)

## Install

```shell
npm i --save react-native-ble-manager-hooks
```

## Usage

```shell

const { loading, onWriteCommand } = useWrite()

const getMacAddress = async () => {

    const data = [\x00, \x00, \x00]

    const [res, err] = await onWriteCommand({
        peripheralID:"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
        serviceUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
        characteristicUUID: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
        data
    })

    if(err) {
        //error logic
    }

}

```
