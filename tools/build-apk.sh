#!/usr/bin/env bash
# Builds a signed release APK from source using only Android SDK build-tools.
# No Gradle, no AndroidX, no network access required at build time.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SDK="${ANDROID_HOME:-/opt/android-sdk}"
BUILD_TOOLS="$SDK/build-tools/34.0.0"
PLATFORM="$SDK/platforms/android-34/android.jar"
MIN_SDK=21
TARGET_SDK=34

APP="$ROOT/android/app/src/main"
OUT="$ROOT/dist"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

for f in "$BUILD_TOOLS/aapt2" "$BUILD_TOOLS/d8" "$BUILD_TOOLS/zipalign" \
         "$BUILD_TOOLS/apksigner" "$PLATFORM"; do
  [ -e "$f" ] || { echo "missing build dependency: $f" >&2; exit 1; }
done

VERSION_NAME="$(grep -oP 'android:versionName="\K[^"]+' "$APP/AndroidManifest.xml")"
VERSION_CODE="$(grep -oP 'android:versionCode="\K[^"]+' "$APP/AndroidManifest.xml")"
APK_NAME="armor-of-god-${VERSION_NAME}.apk"

echo "==> building game bundle"
( cd "$ROOT" && node build.mjs >/dev/null )

echo "==> staging assets"
mkdir -p "$WORK/assets/game"
cp "$ROOT/dist/armor-of-god.html" "$WORK/assets/game/index.html"

echo "==> compiling resources"
mkdir -p "$WORK/compiled"
"$BUILD_TOOLS/aapt2" compile --dir "$APP/res" -o "$WORK/compiled/res.zip"

echo "==> linking resources"
"$BUILD_TOOLS/aapt2" link \
  -o "$WORK/base.apk" \
  -I "$PLATFORM" \
  --manifest "$APP/AndroidManifest.xml" \
  --min-sdk-version "$MIN_SDK" \
  --target-sdk-version "$TARGET_SDK" \
  --version-code "$VERSION_CODE" \
  --version-name "$VERSION_NAME" \
  -A "$WORK/assets" \
  "$WORK/compiled/res.zip"

echo "==> compiling java"
mkdir -p "$WORK/classes"
find "$APP/java" -name '*.java' > "$WORK/sources.txt"
# android.jar on the classpath (not bootclasspath): it lacks LambdaMetafactory,
# so bootstrap classes must come from the JDK. d8 desugars for older devices.
javac -source 11 -target 11 -Xlint:-options -nowarn \
  -classpath "$PLATFORM" \
  -d "$WORK/classes" \
  @"$WORK/sources.txt"

echo "==> dexing"
mkdir -p "$WORK/dex"
"$BUILD_TOOLS/d8" \
  --lib "$PLATFORM" \
  --min-api "$MIN_SDK" \
  --release \
  --output "$WORK/dex" \
  $(find "$WORK/classes" -name '*.class')

echo "==> packaging"
cp "$WORK/base.apk" "$WORK/unsigned.apk"
python3 - "$WORK/unsigned.apk" "$WORK/dex/classes.dex" <<'PY'
import sys, zipfile
apk, dex = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(apk, 'a', zipfile.ZIP_DEFLATED) as z:
    z.write(dex, 'classes.dex')
PY

echo "==> aligning"
"$BUILD_TOOLS/zipalign" -f -p 4 "$WORK/unsigned.apk" "$WORK/aligned.apk"

echo "==> signing"
KEYSTORE="$ROOT/android/keystore/release.jks"
if [ ! -f "$KEYSTORE" ]; then
  echo "==> keystore missing, generating one"
  bash "$ROOT/tools/make_keystore.sh"
fi
mkdir -p "$OUT"
"$BUILD_TOOLS/apksigner" sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:armorofgod \
  --key-pass pass:armorofgod \
  --ks-key-alias armorofgod \
  --min-sdk-version "$MIN_SDK" \
  --v1-signing-enabled true \
  --v2-signing-enabled true \
  --v3-signing-enabled true \
  --out "$OUT/$APK_NAME" \
  "$WORK/aligned.apk"

echo "==> verifying"
"$BUILD_TOOLS/apksigner" verify --verbose "$OUT/$APK_NAME" | head -8
"$BUILD_TOOLS/zipalign" -c -v 4 "$OUT/$APK_NAME" >/dev/null && echo "alignment: OK"

SIZE_KB=$(du -k "$OUT/$APK_NAME" | cut -f1)
echo "built dist/$APK_NAME (${SIZE_KB} KB)"
