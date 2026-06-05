#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."
PROJECT_DIR="$ROOT_DIR/apps/mobile"
ANDROID_DIR="$PROJECT_DIR/android"
BUILD_GRADLE="$ANDROID_DIR/app/build.gradle"
BUILD_DIR="$ROOT_DIR/build"
GRADLE_OUTPUT="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
OUTPUT_FILE="$BUILD_DIR/app-release.aab"

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

CURRENT_VERSION_NAME=$(grep -o 'versionName "[^"]*"' "$BUILD_GRADLE" | sed 's/versionName "\(.*\)"/\1/')
MAJOR=$(echo "$CURRENT_VERSION_NAME" | awk -F. '{print $1+0}')
MINOR=$(echo "$CURRENT_VERSION_NAME" | awk -F. '{print $2+0}')
PATCH=$(echo "$CURRENT_VERSION_NAME" | awk -F. '{print $3+0}')

case "$BUMP" in
    major)   MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
    feature) MINOR=$((MINOR + 1)); PATCH=0 ;;
    fix)     PATCH=$((PATCH + 1)) ;;
esac

NEW_VERSION_NAME="$MAJOR.$MINOR.$PATCH"
sed -i '' "s/versionName \"$CURRENT_VERSION_NAME\"/versionName \"$NEW_VERSION_NAME\"/" "$BUILD_GRADLE"
echo "Bumped versionName: $CURRENT_VERSION_NAME -> $NEW_VERSION_NAME ($BUMP)"

CURRENT_VERSION_CODE=$(grep -o 'versionCode [0-9]*' "$BUILD_GRADLE" | awk '{print $2}')
NEW_VERSION_CODE=$((CURRENT_VERSION_CODE + 1))
sed -i '' "s/versionCode $CURRENT_VERSION_CODE/versionCode $NEW_VERSION_CODE/" "$BUILD_GRADLE"
echo "Bumped versionCode: $CURRENT_VERSION_CODE -> $NEW_VERSION_CODE"

if [ -f "$OUTPUT_FILE" ]; then
    rm "$OUTPUT_FILE"
    echo "Deleted old AAB"
fi

echo "Cleaning build..."
cd "$ANDROID_DIR"
./gradlew clean

echo "Building release AAB..."
./gradlew bundleRelease

mkdir -p "$BUILD_DIR"
cp "$GRADLE_OUTPUT" "$OUTPUT_FILE"

echo "Verifying AAB signature..."
if ! jarsigner -verify "$OUTPUT_FILE" > /dev/null 2>&1; then
    echo "ERROR: AAB is not signed. Aborting before commit/tag."
    echo "Run 'jarsigner -verify -verbose $OUTPUT_FILE' for details."
    exit 1
fi
echo "AAB signature verified."

cd "$ROOT_DIR"
TAG_NAME="android-v$NEW_VERSION_NAME"
COMMIT_MSG="Android release $NEW_VERSION_NAME ($BUMP)

- versionName: $CURRENT_VERSION_NAME -> $NEW_VERSION_NAME
- versionCode: $CURRENT_VERSION_CODE -> $NEW_VERSION_CODE"

git add "$BUILD_GRADLE"
git commit -m "$COMMIT_MSG"
git tag -a "$TAG_NAME" -m "Android release $NEW_VERSION_NAME (versionCode $NEW_VERSION_CODE)"
echo "Committed version bump and tagged: $TAG_NAME"

echo ""
echo "Build complete!"
echo "AAB: $OUTPUT_FILE"
echo "Tag: $TAG_NAME (not pushed — run 'git push && git push --tags' when ready)"
