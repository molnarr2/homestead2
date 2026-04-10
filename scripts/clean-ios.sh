#!/bin/bash
set -e
echo "Cleaning iOS build..."
cd "$(dirname "$0")/../apps/mobile"
cd ios
rm -rf build Pods Podfile.lock
pod cache clean --all
cd ..
rm -rf node_modules
npm install
cd ios
pod install
echo "iOS clean complete."
