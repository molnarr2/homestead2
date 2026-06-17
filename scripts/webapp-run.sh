#!/bin/bash
set -e
echo "Starting webapp dev server (apps/web)..."
cd "$(dirname "$0")/.."
yarn workspace @homestead/web dev
