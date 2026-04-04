#!/bin/bash
cd "$(dirname "$0")/.." && firebase deploy --only functions
