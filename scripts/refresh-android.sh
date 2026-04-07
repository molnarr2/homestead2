#!/bin/bash
#
# Refresh the React Native autolinking cache for apps/mobile.
#
# React Native's Gradle autolinking task does not list node_modules or
# package.json as task inputs, so installing a new native module leaves a
# stale autolinking.json in android/build/generated/autolinking/ that
# `./gradlew clean` and Android Studio's Clean/Rebuild do NOT delete.
# The result: new native modules are silently not linked and you get
# `TurboModuleRegistry <Name> not found` at runtime.
#
# Run this after adding, removing, or upgrading any native dependency.
#
# Usage:
#   ./scripts/refresh-android.sh          # just clear the cache
#   ./scripts/refresh-android.sh --run    # clear the cache and run the app

set -e

APP_PATH="$(cd "$(dirname "$0")/../apps/mobile" && pwd)"

if [ ! -d "$APP_PATH/android" ]; then
    echo "Error: Expected Android project at $APP_PATH/android"
    exit 1
fi

echo "Clearing autolinking caches in $APP_PATH/android..."
rm -rf "$APP_PATH/android/build/generated/autolinking"
rm -rf "$APP_PATH/android/app/build/generated/autolinking"
echo "Done."

if [ "$1" = "--run" ] || [ "$1" = "-r" ]; then
    cd "$APP_PATH" && yarn android
fi
