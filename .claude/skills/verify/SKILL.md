---
name: verify
description: Verify the app actually works on a mobile viewport using Playwright with a faked mic stream — drives the real UI (start → burp → result → reset), checks both allow and deny mic paths, and reports console errors. Gates the build/oneshot loop. Trigger on "/verify", "verify it works", "test on mobile", or internally from /oneshot and /implement.
---

# /verify — does it actually work on a phone?

The gate for the loop. Builds, serves, and drives the app in a **mobile-emulated** browser with a
**fake audio stream**, so the mic mechanic is exercised without a real burp. Uses the Playwright
plugin (`playwright@claude-plugins-official`). Checks against `_shared/definition-of-done.md`.

## Procedure
1. **Build & serve:** `npm run build` then serve the production build (`npm run preview`) — verify
   the *built* app, not just dev, so base-path/asset issues surface.
2. **Mobile context:** drive Chromium emulating ~390×844 (iPhone-class) and re-check at 320 px width.
   Launch with fake-media flags so `getUserMedia` succeeds headlessly and the meter gets signal:
   `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`
   (optionally `--use-file-for-fake-audio-capture=<loud.wav>` to simulate a big burp).
3. **Happy path:** load → tap start/allow → confirm the gauge moves, a magnitude is produced,
   peak-hold updates, the result persists to the leaderboard after reload, and share is present.
4. **Failure paths:** with mic **denied** (no fake-ui flag, or deny the permission) confirm a
   friendly fallback and **no crash**; confirm an insecure/unsupported context degrades gracefully.
5. **Console:** assert no uncaught errors across the full run. Capture a screenshot at 390 px for the report.
6. **Report:** per-DoD-item pass/fail. Any fail → hand the exact output back to the loop to fix.

## Output
A short checklist mapped to the DoD, plus the mobile screenshot. Green = the loop may mark this slice done.
