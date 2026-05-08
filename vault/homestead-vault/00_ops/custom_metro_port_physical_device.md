# Custom Metro Port on Physical iOS Devices

## Problem

When running multiple React Native apps on one machine, each needs its own Metro port. Homestead uses port **8083**. On a physical iOS device (not simulator), the app fails to connect to Metro with "Connection refused" errors.

Two connection attempts fail:
1. `localhost:8083` - On a physical device, `localhost` is the phone itself, not the Mac. Connection refused.
2. `192.168.50.250:8081` - React Native's WiFi fallback finds the Mac's IP via `ip.txt` but uses the default port 8081, not 8083.

## Root Cause

React Native's fallback port is controlled by the `RCT_METRO_PORT` C preprocessor macro. The React-Core xcconfig references it as an Xcode build setting:

```
GCC_PREPROCESSOR_DEFINITIONS = $(inherited) COCOAPODS=1 RCT_METRO_PORT=${RCT_METRO_PORT}
```

If the Xcode build setting `RCT_METRO_PORT` is never defined, it resolves to empty string, and `RCTDefines.h` falls back to 8081.

## Fix (two parts)

### 1. AppDelegate.swift - handles simulator

```swift
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsLocation = "localhost:8083"
#endif
```

On the simulator, `localhost` is the Mac, so this works directly. On a physical device this attempt fails, but React Native falls through to auto-discovery (part 2).

### 2. Podfile post_install - handles physical devices

```ruby
installer.pods_project.targets.each do |target|
  target.build_configurations.each do |config|
    config.build_settings['RCT_METRO_PORT'] = '8083'
  end
end
```

This sets `RCT_METRO_PORT` as an actual Xcode build setting on each pod target. When the xcconfig resolves `${RCT_METRO_PORT}` at build time, it finds `8083` instead of falling back to `8081`.

After changing, run `pod install` and do a clean build (Product > Clean Build Folder).

### 3. start-metro.sh

```bash
cd "$(dirname "$0")/../apps/mobile" && yarn start --reset-cache --port 8083
```

## How physical device connection works

1. During Xcode build, `react-native-xcode.sh` writes the Mac's IP to `ip.txt` in the app bundle
2. At runtime, `RCTBundleURLProvider.guessPackagerHost` reads `ip.txt` to get the Mac's IP
3. Since `ip.txt` contains only the IP (no port), `serverRootWithHostPort` appends `RCT_METRO_PORT`
4. The app connects to `http://<mac-ip>:8083/`

## Common mistake

`ENV['RCT_METRO_PORT'] = '8083'` in the Podfile sets a Ruby environment variable, **not** an Xcode build setting. The xcconfig `${RCT_METRO_PORT}` resolves Xcode build settings, not shell/Ruby env vars. You must use `config.build_settings['RCT_METRO_PORT']` in the post_install block.

## New laptop setup checklist

- [ ] `pod install` after cloning
- [ ] Clean build from Xcode (the `RCT_METRO_PORT` build setting must be compiled in)
- [ ] `.xcode.env.local` has correct `NODE_BINARY` path for this machine
- [ ] Mac firewall allows incoming connections (System Settings > Network > Firewall)
- [ ] Phone and Mac on same WiFi network
