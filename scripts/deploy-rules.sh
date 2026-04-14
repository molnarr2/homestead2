#!/bin/bash
set -e
echo "Deploying Firestore and Storage rules..."
cd "$(dirname "$0")/.."
firebase deploy --only firestore:rules,storage --project homestead-prod
echo "Rules deployed."
