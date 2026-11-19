#!/usr/bin/env bash
# Creates the local signing keystore used by tools/build-apk.sh.
#
# This is a self-signed key for sideloaded builds, not a Play Store upload key.
# It is gitignored on purpose: keep it, and keep it backed up, or you will be
# unable to ship an update that Android will accept over an existing install.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEYSTORE="$ROOT/android/keystore/release.jks"

if [ -f "$KEYSTORE" ]; then
  echo "keystore already exists: android/keystore/release.jks"
  exit 0
fi

mkdir -p "$(dirname "$KEYSTORE")"
keytool -genkeypair -v \
  -keystore "$KEYSTORE" \
  -alias armorofgod \
  -keyalg RSA -keysize 2048 -validity 10950 \
  -storepass armorofgod -keypass armorofgod \
  -dname "CN=Armor of God, OU=Games, O=Mubogi, L=Internet, S=Web, C=US"

echo "created android/keystore/release.jks"
