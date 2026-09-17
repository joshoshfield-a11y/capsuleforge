#!/usr/bin/env bash
# CapsuleForge release push via butler (https://itch.io/docs/butler/)
# 1) Download butler for your platform, add to PATH, run: butler login
# 2) Create the CapsuleForge project page on itch.io (Tools category) — pages can't be created via CLI
# 3) Then run this script.
set -euo pipefail
PROJECT="skitworks/capsuleforge"   # change 'skitworks' to your itch username
DIR="$(cd "$(dirname "$0")" && pwd)"

# Paid download: full tool (batch export + persistence)
butler push "$DIR/../capsuleforge-full" "$PROJECT:full" \
  --userversion 1.0.0

# Free web demo (single-size export) — itch HTML project, "playable in browser"
butler push "$DIR/../../capsuleforge-itch-demo.zip" "$PROJECT:web-demo" \
  --userversion 1.0.0

# Android app
butler push "$DIR/../../CapsuleForge-v1.0.0.apk" "$PROJECT:android" \
  --userversion 1.0.0

echo "Done. Check https://itch.io/ to verify the uploads."
