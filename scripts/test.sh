#!/bin/bash
set -e
echo "Running tests..."
cd "$(dirname "$0")/../apps/mobile"
npm test
echo "Tests complete."
