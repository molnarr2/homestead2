#!/bin/bash
set -e
echo "Running Homestead on iOS..."
SIMULATOR="${1:-iPhone 16}"
cd "$(dirname "$0")/../apps/mobile"
npx react-native run-ios --simulator "$SIMULATOR" --port 8083
