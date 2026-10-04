# Selling CapsuleForge on itch.io — Launch Playbook

## Positioning
CapsuleForge is 100% client-side. Upload `index.html` + `studio.js` to itch as an
**HTML project** so the store page has a "Run tool" button. Tools people can try
instantly convert far better than download-only listings. The mobile-responsive
layout means the demo even works on phones — someone browsing itch on mobile can
use your tool on that phone.

## The Steam lever (v1.1)
The itch.io Tools market is real but small. Steam devs are the bigger-spending
audience: they pay a $100/app fee and routinely pay freelancers $50+ for capsule
art. The Steam preset pack (header 920×430, small 462×174, main 1232×706,
vertical 748×896, library capsule 600×900, hero 3840×1240, logo 1280×720 —
verified against Valve's current spec) is the paid-tier headline feature. Pitch
line for Steam devs: "every capsule Steam asks for, from one screenshot, in
your browser, for the price of a coffee."

## Pricing
- Publish under itch's **Tools** category (not Games).
- **$5 minimum, pay-what-you-want.** The itch Tools market clusters at
  $5-or-less; $5 reads as a real tool while staying an impulse buy against
  $50+ Fiverr gigs.
- 20% launch-week discount to seed purchases and reviews.
- Later: a **$12 "Pro/Studio" tier** (separate paid file or listing) bundling
  the Steam pack + future template drops, once the base tier has traction.

## Freemium split
- Free web demo: full editor, all 6 templates, single-size export, itch.io
  sizes only. The templates are the hook — keep them free.
- Paid ($5 PWYW): batch export of every size, brand persistence via
  localStorage, and the full Steam preset pack.
- Gating is UI-level only (the demo zip swaps the batch button for an upsell
  link and strips the Steam array; `studio.js` ships the functions in both).
  Standard for PWYW tools — don't market it as locked-down.

## Charge-ready checklist
1. Replace `ITCH_USER` in `studio.js` + `marketing/butler-push.sh`
   (placeholder `skitworks` 404s) and `OG_IMAGE_URL` in `index.html`.
2. Create the itch page under Tools (browser only — can't be done via CLI).
3. Dogfood it: build the cover + screenshots with CapsuleForge itself.
4. Animated GIF cover (~5s: screenshot drop → template switch) — dominates
   browse pages. A generator script lives in `marketing/make-cover-gif.sh`
   (Playwright + ffmpeg; run it, drop the output on the itch page).
5. Run `marketing/butler-push.sh` to rebuild both zips (needs `butler login`
   once); upload the demo as an HTML project, the full zip as paid download.
6. Optional: build the Android APK (`android/README.md`) for the android channel.
7. Launch week: #screenshotsaturday, r/gamedev, r/itchio, game-jam Discords
   (devs need key art fast before jams), one itch devlog post.

## The itch page is the portfolio
Build your own itch page USING CapsuleForge (dogfood it): cover 630x500 from the
most dramatic sample, screenshot grid of all six templates, showcase.png included.

## Cover image
itch allows animated GIF covers. Record ~5s of a screenshot dropping in and a
template switching; convert to GIF. Animated covers dominate browse pages.

## Discoverability
- Tags: `tool`, `asset-generator`, `key-art`, `cover-maker`, `marketing`, `gamedev`
- Devlog posts on itch (algorithm favors active projects)
- #screenshotsaturday on X/Twitter, r/itchio, r/gamedev, indie dev Discords,
  gamejam announcement channels (devs need key art fast before jams)
- Bundle later with your other assets for bundle-page traffic

## Short description pitch
"Turn gameplay screenshots into every store asset your itch page needs - covers,
thumbnails, OG cards - right in your browser."
