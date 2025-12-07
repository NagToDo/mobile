# NagToDo Mobile (Expo)

Minimal notes for local development.

## Prerequisites

- Node/npm installed.
- Android SDK installed at `~/Library/Android/sdk` (required for dev builds).
- `mobile/android/local.properties` already points to the SDK:
  ```
  sdk.dir=/Users/ncabibbo/Library/Android/sdk
  ```

## Install

```
npm install
```

## Run (Expo Go)

```
npx expo start --android
```

## Run (dev build)

```
npx expo run:android
```
