#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."
PROJECT_DIR="$ROOT_DIR/apps/mobile"
PBXPROJ="$PROJECT_DIR/ios/mobile.xcodeproj/project.pbxproj"

echo "What type of release is this?"
echo "  1) major   (X.y.z -> (X+1).0.0)"
echo "  2) feature (x.Y.z -> x.(Y+1).0)"
echo "  3) fix     (x.y.Z -> x.y.(Z+1))"
read -p "Enter 1, 2, or 3: " RELEASE_TYPE

case "$RELEASE_TYPE" in
    1) BUMP="major" ;;
    2) BUMP="feature" ;;
    3) BUMP="fix" ;;
    *) echo "Invalid selection: $RELEASE_TYPE"; exit 1 ;;
esac

CURRENT_VERSION=$(grep -m1 'MARKETING_VERSION' "$PBXPROJ" | sed 's/.*MARKETING_VERSION = \([^;]*\);/\1/' | tr -d ' ')
MAJOR=$(echo "$CURRENT_VERSION" | awk -F. '{print $1+0}')
MINOR=$(echo "$CURRENT_VERSION" | awk -F. '{print $2+0}')
PATCH=$(echo "$CURRENT_VERSION" | awk -F. '{print $3+0}')

case "$BUMP" in
    major)   MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
    feature) MINOR=$((MINOR + 1)); PATCH=0 ;;
    fix)     PATCH=$((PATCH + 1)) ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
sed -i '' "s/MARKETING_VERSION = $CURRENT_VERSION;/MARKETING_VERSION = $NEW_VERSION;/g" "$PBXPROJ"
echo "Bumped MARKETING_VERSION: $CURRENT_VERSION -> $NEW_VERSION ($BUMP)"

CURRENT_BUILD=$(grep -m1 'CURRENT_PROJECT_VERSION' "$PBXPROJ" | sed 's/.*CURRENT_PROJECT_VERSION = \([^;]*\);/\1/' | tr -d ' ')
NEW_BUILD=$((CURRENT_BUILD + 1))
sed -i '' "s/CURRENT_PROJECT_VERSION = $CURRENT_BUILD;/CURRENT_PROJECT_VERSION = $NEW_BUILD;/g" "$PBXPROJ"
echo "Bumped CURRENT_PROJECT_VERSION: $CURRENT_BUILD -> $NEW_BUILD"

cd "$ROOT_DIR"
TAG_NAME="ios-v$NEW_VERSION"
COMMIT_MSG="iOS release $NEW_VERSION ($BUMP)

- MARKETING_VERSION: $CURRENT_VERSION -> $NEW_VERSION
- CURRENT_PROJECT_VERSION: $CURRENT_BUILD -> $NEW_BUILD"

git add "$PBXPROJ"
git commit -m "$COMMIT_MSG"
git tag -a "$TAG_NAME" -m "iOS release $NEW_VERSION (build $NEW_BUILD)"
echo "Committed version bump and tagged: $TAG_NAME"

echo ""
echo "Version set!"
echo "Tag: $TAG_NAME (not pushed — run 'git push && git push --tags' when ready)"
