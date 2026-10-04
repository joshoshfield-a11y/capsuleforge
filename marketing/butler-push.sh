#!/usr/bin/env bash
# CapsuleForge release pipeline.
#
# WHAT IT DOES
#   1. Rebuilds both distributable zips from current source (so they never go stale).
#   2. Pushes them to itch.io via butler (https://itch.io/docs/butler/).
#
# PREREQUISITES (one time)
#   1. Download butler for your platform, add it to PATH, run:  butler login
#   2. Create the CapsuleForge project page on itch.io (Tools category).
#      Pages can't be created via CLI — do it in the browser first.
#   3. Set ITCH_USER below to your itch.io username.
#   4. Build the Android APK first if you want the android channel:
#      see android/README.md, then place the APK at the path below.
#
# NOTE: for the free HTML demo you don't need butler at all — itch.io's web
# dashboard accepts the zip directly ("Upload files" → "This file will be
# played in the browser"). Butler is worth it for the paid download's
# versioning (patch/diff uploads).
set -euo pipefail

ITCH_USER="${ITCH_USER:-SkiticusPrime}"   # <-- your itch.io username (or export ITCH_USER)
PROJECT="$ITCH_USER/capsuleforge"
VERSION="1.1.0"
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"
OUT="$DIR"
APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"

if [ "$ITCH_USER" = "CHANGEME" ]; then
  echo "WARNING: ITCH_USER is still the placeholder."
  echo "the placeholder does not resolve — set your real username:"
  echo "  ITCH_USER=yourname $0"
  echo "Continuing with placeholder in 5s (Ctrl-C to stop)…"
  sleep 5
fi

command -v butler >/dev/null || { echo "butler not found in PATH — https://itch.io/docs/butler/"; exit 1; }
command -v zip >/dev/null || { echo "zip not found in PATH"; exit 1; }

echo "==> Rebuilding distributable zips from current source…"
# Full (paid) tool: everything needed to run it + license + readme
rm -f "$OUT/capsuleforge-full.zip"
(cd "$ROOT" && zip -q -9 "$OUT/capsuleforge-full.zip" index.html studio.js LICENSE README.md)
# Free web demo: same engine, batch-export button swapped for an upsell link.
# NOTE: the gating is UI-level only (studio.js ships the batch function);
# this is standard for pay-what-you-want tools — don't claim otherwise.
rm -f "$OUT/capsuleforge-itch-demo.zip"
TMP="$(mktemp -d)"
cp "$ROOT/index.html" "$ROOT/studio.js" "$TMP/"
UPSELL="https://$ITCH_USER.itch.io/capsuleforge"
python3 - "$TMP/index.html" "$UPSELL" <<'EOF'
import sys
p, url = sys.argv[1], sys.argv[2]
s = open(p).read()
old = '<button id="exportall" style="width:100%">⬇⬇ Export every size (itch.io + Steam)</button>'
new = f'<button style="width:100%" onclick="window.open(\'{url}\',\'_blank\')">⬆ Get batch export + Steam sizes — full version</button>'
assert old in s, "exportall button markup changed — update this script"
open(p, "w").write(s.replace(old, new))
EOF
# Strip the Steam preset pack from the demo's studio.js (paid-tier gating).
# UI-level only, same as the batch-export upsell above: the demo build simply
# has no Steam sizes to select or export.
python3 - "$TMP/studio.js" <<'EOF'
import re, sys
p = sys.argv[1]
s = open(p).read()
pat = re.compile(r"const STEAM_SIZES = \[.*?\];", re.DOTALL)
s2, n = pat.subn("const STEAM_SIZES = []; // stripped in demo build", s)
assert n == 1, f"expected 1 STEAM_SIZES block, found {n} — update this script"
open(p, "w").write(s2)
EOF
(cd "$TMP" && zip -q -9 "$OUT/capsuleforge-itch-demo.zip" index.html studio.js)
rm -rf "$TMP"
echo "    zips rebuilt."

echo "==> Pushing to itch.io ($PROJECT)…"
butler push "$OUT/capsuleforge-full.zip" "$PROJECT:full" --userversion "$VERSION"
butler push "$OUT/capsuleforge-itch-demo.zip" "$PROJECT:web-demo" --userversion "$VERSION"

if [ -f "$APK" ]; then
  butler push "$APK" "$PROJECT:android" --userversion "$VERSION"
else
  echo "    (skipping android channel — no APK at $APK; see android/README.md)"
fi

echo "Done. Verify at https://$ITCH_USER.itch.io/capsuleforge"
