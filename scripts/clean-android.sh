#!/bin/bash
set -e
echo "Cleaning Android build..."
cd "$(dirname "$0")/../apps/mobile"
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install
echo "Android clean complete."
