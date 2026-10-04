#!/usr/bin/env bash
# make-cover-gif.sh — regenerate marketing/cover-animated.gif for the itch page.
# Records: seeded sample key art -> template switches (Ember -> Ocean -> Toxic).
# Requires: python3 + playwright chromium (ml-stack venv) + ffmpeg.
# Output: marketing/cover-animated.gif (630px wide, ~5s, optimized palette).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRAMES="$(mktemp -d)"
OUT="$ROOT/marketing/cover-animated.gif"
PY="${PY:-$HOME/workspace/venvs/ml-stack/bin/python}"

"$PY" - "$ROOT/index.html" "$FRAMES" <<'EOF'
import sys
from playwright.sync_api import sync_playwright
page_path, frames = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1000, "height": 760})
    pg.goto("file://" + page_path)
    pg.wait_for_timeout(600)
    pg.click("#sample")            # seeded sample key art, no assets needed
    pg.wait_for_timeout(400)
    n = 0
    # hold ember, then switch ocean -> violet -> toxic, ~12 frames each at 8fps
    for tpl_i in [0, 1, 2, 5]:
        pg.eval_on_selector_all("#tpls .tpl", f"els => els[{tpl_i}].click()")
        for _ in range(12):
            pg.screenshot(path=f"{frames}/f{n:03d}.png")
            n += 1
            pg.wait_for_timeout(125)
    b.close()
print(f"captured {n} frames", file=sys.stderr)
EOF

# crop to the canvas region is overkill — scale full page shot to 630 wide, 8fps, palette-optimized
ffmpeg -y -v error -framerate 8 -i "$FRAMES/f%03d.png" \
  -vf "scale=630:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse" \
  "$OUT"
rm -rf "$FRAMES"
echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
