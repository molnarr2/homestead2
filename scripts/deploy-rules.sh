#!/bin/bash
cd "$(dirname "$0")/.." && firebase deploy --only firestore:rules,storage:rules
