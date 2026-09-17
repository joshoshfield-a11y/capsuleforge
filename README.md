# CapsuleForge — itch.io Marketing Asset Studio

Turn gameplay screenshots into every store asset your itch.io page needs.
**100% client-side. No uploads, no server, no build step, no dependencies.**

## Run it

Open `index.html` in any modern browser. That's it.

(If your browser blocks local file access — it shouldn't, everything is inline —
serve the folder: `python3 -m http.server 8094` → http://localhost:8094)

## Mobile

Fully responsive — under 860px the layout stacks with the live preview on top,
controls below, and a sticky export bar pinned to the bottom. Works in mobile
browsers; use it on a phone to iterate on key art from your camera roll.

## What it does

- **Exact itch.io dimensions as presets** — cover 630×500, thumbnail 315×250,
  OG/Twitter card 1200×630, square 512×512, banner 960×540, wide 800×450
- **6 art-directed templates** (Ember, Ocean, Violet, Gold, Mono, Toxic)
- **Drag-and-drop screenshots** as backgrounds, with a crop slider
- **Seeded sample key-art generator** — evaluate the tool with zero assets
- **Branding**: title, tagline, developer credit, accent + text colors
- **Platform badges** (Windows / macOS / Linux / Web / Android toggles)
- **Composition controls**: 9 text anchors, title size (auto or manual),
  glow, vignette, gradient overlay, scanlines
- **Batch export**: one click downloads every size
- **Brand persistence** via localStorage — set once, reused every session

## How to use it for your game's page

1. Drop 1–3 of your best screenshots (combat, vista, key art)
2. Set title / tagline / dev name
3. Pick a template that matches your game's mood
4. Adjust anchor so text doesn't cover the focal point
5. Hit **Export every itch.io size**
6. Upload the PNGs to your itch.io edit page

## Files

- `index.html` — UI shell (self-contained)
- `studio.js` — compositing engine (vanilla canvas, no deps)
- `samples/` — six template renders (what the tool produces out of the box)
- `showcase.png` — all six templates side by side

## License

Yours. Ship assets you make with it anywhere. Redistribute the tool with your
game's branding if you like.
