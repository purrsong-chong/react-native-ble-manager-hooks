# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.1](https://github.com/purrsong-chong/react-native-ble-manager-hooks/compare/v0.3.0...v0.3.1) (2025-12-15)


### Bug Fixes

* ensure proper state management in useBleManagerInit and useBleScan hooks ([ab72572](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/ab725727ef2523fc54415aa70f09312f2c588924))
* remove redundant onConnected callback invocation in useBlePeripheral hook ([096d8cf](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/096d8cf20f7b2ee1b1472ee52386170b38882ccf))


### Docs

* enhance README with new hooks for Bluetooth state management, scanning, and peripheral management ([02e1d43](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/02e1d43aa77c6d2d6e75032183cde896a6c33c73))


### Others

* update package.json keywords to include new hooks and integrations for react-native-ble-manager ([15f2a74](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/15f2a74ab2810c3e4c986ab5e276546e01653de9))


### Code Refactoring

* remove unnecessary state updates in useBleManagerInit and useBleScan hooks ([e2c84fe](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/e2c84fe3d539659d4b52e0101ffe0d3fba24caef))

## [0.3.0](https://github.com/purrsong-chong/react-native-ble-manager-hooks/compare/v0.2.3...v0.3.0) (2025-12-15)


### Features

* add useBleManagerInit hook for managing BLE manager initialization state ([3ebd1f7](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/3ebd1f768f5485924b86e9cab21e21ee0454a412))
* add useBlePeripheral hook for managing BLE peripheral connections and notifications ([843cef3](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/843cef3954e6d01f14e321c3712889ef7152cdab))
* add useBluetoothState hook for managing Bluetooth service state ([61426da](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/61426da3d126812cbfc560564b0ae536e1a66bd5))
* define PeripheralConnectionState type and update comments in useWrite for clarity ([72aa5a6](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/72aa5a6d295a1654473ded8309e8a83e08eb246b))
* export additional hooks and types for Bluetooth and BLE management ([f894dec](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/f894dec8e44e1c569a853ed9d5a39da58afdce47))
* implement useBleScan hook for managing BLE peripheral scanning ([175922c](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/175922c8ae86149a0665eaa871c337ccdc0f019a))


### Others

* update packageManager field in package.json to remove SHA512 hash ([78dd63f](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/78dd63f508416fc933f9d4784ced0b65a0fd5a1f))
* update repository URL and author information in package.json ([8ff0924](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/8ff09241605ddc3a506ad09f5c3e5e1fe19db43f))


### Code Refactoring

* update comments in BleCommandManager.ts to English for clarity and consistency ([b89f13a](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/b89f13a6b48c9bf38db6687dc505abea3c96ca48))
* update useBleScan hook to use Peripheral type for better type safety ([86c54d2](https://github.com/purrsong-chong/react-native-ble-manager-hooks/commit/86c54d2d3cb0e9b23191b1b64a5efbd67935537e))

### [0.2.3](https://github.com/chongs02/react-native-ble-manager-hooks/compare/v0.2.2...v0.2.3) (2025-12-05)


### Others

* remove package-lock.json file ([df7dcd2](https://github.com/chongs02/react-native-ble-manager-hooks/commit/df7dcd2057d2b51d787a1a2e82eab40b9284193e))

### [0.2.2](https://github.com/chongs02/react-native-ble-manager-hooks/compare/v0.2.1...v0.2.2) (2025-12-05)


### Bug Fixes

* remove unused error handling for command errors ([b6d942a](https://github.com/chongs02/react-native-ble-manager-hooks/commit/b6d942a534881bad97f26e3f17c5195458758ef5))


### Docs

* **readme:** enhance documentation with detailed features, usage examples, and API reference for BLE command management ([306e652](https://github.com/chongs02/react-native-ble-manager-hooks/commit/306e652191fe19ed771e10c0d1250c0c181bdbc4))

### 0.2.1 (2025-12-05)

### Features

- **BleCommandManager:** implement BLE command management with singleton pattern and command queue processing ([ac0bbcb](https://github.com/chongs02/react-native-ble-manager-hooks/commit/ac0bbcb3ca2007db1becbcdc127b80e401b91f98))
- **types:** add TypeScript types for BLE communication management ([e0408ad](https://github.com/chongs02/react-native-ble-manager-hooks/commit/e0408ad15b906c794a89fbf4700819b5450e6745))

### Styling

- **comment:** add comment for functions ([b53ddee](https://github.com/chongs02/react-native-ble-manager-hooks/commit/b53ddeec8c9201d2505c8b208c2c1e81a0580715))

### Docs

- **changelog:** fix changelog ([bede652](https://github.com/chongs02/react-native-ble-manager-hooks/commit/bede652d95a3dc75e46e23e9363e28f32dd75ba1))
- **example:** add example in readme ([0987ebd](https://github.com/chongs02/react-native-ble-manager-hooks/commit/0987ebdf4dbb9b408be5cf08d3a7318075c824e6))
- **readme:** add readme ([b69e5d0](https://github.com/chongs02/react-native-ble-manager-hooks/commit/b69e5d0c4110f16a5417d1a9f0f785a66475f127))
- **readme:** fix example ([7f22e69](https://github.com/chongs02/react-native-ble-manager-hooks/commit/7f22e6980bff259c876644f50446b5afa8a25968))

### Others

- **commit:** add commit roles and changeLog.md ([4829c7d](https://github.com/chongs02/react-native-ble-manager-hooks/commit/4829c7dd04a9bb5f049dea21fc21cace1cc881d0))
- **gitignore:** git should ignore [Develop] test project ([97bf91a](https://github.com/chongs02/react-native-ble-manager-hooks/commit/97bf91a04641940445908c85a273b5c9b50399d4))
- **keyword:** add keyword to find ([75c9f35](https://github.com/chongs02/react-native-ble-manager-hooks/commit/75c9f35dbf4a54f7843d40ccf57d10682391603c))
- **release:** 0.1.3 ([5522abe](https://github.com/chongs02/react-native-ble-manager-hooks/commit/5522abe6497aec4e7d2c71f3eb24aa8367a997fb))
- **release:** 0.1.4 ([68e9ea7](https://github.com/chongs02/react-native-ble-manager-hooks/commit/68e9ea79765829890e94a206a8e0ca009fa6f437))
- **release:** bump version to 0.2.0 and update dependencies ([35fabd1](https://github.com/chongs02/react-native-ble-manager-hooks/commit/35fabd1d682a395816a7e77611532d0b23499298))

### Code Refactoring

- remove unused sleep utility and useSwitchState hook ([68a4a1b](https://github.com/chongs02/react-native-ble-manager-hooks/commit/68a4a1b5372c02a9c5ec4a402ceabef6a6ebf2b8))
- **useWrite:** simplify BLE write logic and integrate BleCommandManager for command handling ([733ee08](https://github.com/chongs02/react-native-ble-manager-hooks/commit/733ee08b8dfc2fd57f8f06eca4e3744d591faa0c))

### [0.1.4](https://github.com/chongs02/react-native-ble-manager-hooks/compare/v0.1.3...v0.1.4) (2022-09-11)

### Others

- **commit:** add commit roles and changeLog.md ([4829c7d](https://github.com/chongs02/react-native-ble-manager-hooks/commit/4829c7dd04a9bb5f049dea21fc21cace1cc881d0))
- **gitignore:** git should ignore [Develop] test project ([97bf91a](https://github.com/chongs02/react-native-ble-manager-hooks/commit/97bf91a04641940445908c85a273b5c9b50399d4))

### Styling

- **comment:** add comment for functions ([b53ddee](https://github.com/chongs02/react-native-ble-manager-hooks/commit/b53ddeec8c9201d2505c8b208c2c1e81a0580715))

### Docs

- **readme:** add readme ([b69e5d0](https://github.com/chongs02/react-native-ble-manager-hooks/commit/b69e5d0c4110f16a5417d1a9f0f785a66475f127))

### [0.1.1](https://github.com/chongs02/react-native-ble-manager-hooks/compare/v0.1.0...v0.1.1) (2022-09-05)

### Others

- **release:** 0.1.0 ([666878c](https://github.com/chongs02/react-native-ble-manager-hooks/commit/666878cdd6ff1a793eb52ddfaebe90e3fce1c1d5))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
