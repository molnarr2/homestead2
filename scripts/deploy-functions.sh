#!/bin/bash
set -e
echo "Building Cloud Functions..."
cd "$(dirname "$0")/../functions"
npm run build
echo "Deploying Cloud Functions..."
cd "$(dirname "$0")/.."
firebase deploy --only functions --project <PROJECT_ID>
echo "Functions deployed."
