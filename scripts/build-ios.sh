#!/bin/bash
cd "$(dirname "$0")/../apps/mobile/ios" && bundle install && bundle exec pod install && xcodebuild -workspace mobile.xcworkspace -scheme mobile -configuration Release -sdk iphoneos build
