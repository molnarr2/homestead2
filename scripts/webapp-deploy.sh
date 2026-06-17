#!/bin/bash
set -e
echo "Building webapp..."
"$(dirname "$0")/webapp-build.sh"
echo "Deploying webapp to Firebase Hosting (homestead-prod.web.app)..."
cd "$(dirname "$0")/.."
firebase deploy --only hosting --project homestead-prod
echo "Webapp deployed to https://homestead-prod.web.app"
