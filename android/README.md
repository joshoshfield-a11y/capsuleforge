# CapsuleForge Android app

Minimal WebView wrapper around the 100% client-side studio (`index.html` +
`studio.js`). Exports go through the page's `AndroidBridge.savePNG` hook into
the device gallery (`Pictures/CapsuleForge`); the file picker is wired via
`onShowFileChooser` so screenshot uploads work in-app.

## Build

```bash
cd android
export JAVA_HOME=$HOME/jdk17
export ANDROID_HOME=$HOME/android-sdk   # or ANDROID_SDK_ROOT
export GRADLE_USER_HOME=/root/.gradle  # reuse cached AGP (or omit to download)
$HOME/gradle-8.7/bin/gradle assembleRelease
# APK: app/build/outputs/apk/release/app-release.apk
```

Notes:
- `syncWebAssets` copies the repo-root `index.html`/`studio.js` into
  `app/src/main/assets/` on every build — the web files are the single
  source of truth, never edit the copies.
- Debug-signed by default (`~/.android/debug.keystore`). For itch.io
  distribution that's fine; for the Play Store, sign with a release key
  and keep it out of git.
- `minSdk 26`, `targetSdk 34`, `compileSdk 35`.
- No internet permission needed — the tool runs fully offline (Google Fonts
  degrade to system fonts without network).
