#!/bin/bash
set -e
echo "Deploying everything..."
"$(dirname "$0")/deploy-rules.sh"
"$(dirname "$0")/deploy-functions.sh"
echo "All deployments complete."
