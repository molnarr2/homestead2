#!/bin/bash
set -e
echo "Building webapp (apps/web)..."
cd "$(dirname "$0")/.."
yarn workspace @homestead/web build
echo "Webapp built to apps/web/dist."
