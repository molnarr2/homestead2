#!/bin/bash
cd "$(dirname "$0")/../apps/mobile/ios" && bundle install && bundle exec pod install
