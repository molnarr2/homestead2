#!/bin/bash
set -e
echo "Running Homestead on Android..."
cd "$(dirname "$0")/../apps/mobile"

if [ -z "$JAVA_HOME" ]; then
  echo "Error: JAVA_HOME is not set"
  exit 1
fi
if [ -z "$ANDROID_HOME" ]; then
  echo "Error: ANDROID_HOME is not set"
  exit 1
fi

npx react-native run-android --port 8083
