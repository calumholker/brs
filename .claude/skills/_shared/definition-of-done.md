# Shared: Definition of Done ("production ready")

The loop in `/oneshot` exits only when **all** of these pass. Each is mechanically checkable —
no vibes. Re-run after every Codex dispatch.

## Build & types
- [ ] `npm run build` succeeds with no errors.
- [ ] `npx tsc --noEmit` is clean (strict TypeScript).
- [ ] `npm run lint` is clean (or only intentional, documented disables).

## Core feature (the burp meter)
- [ ] On a user gesture, the app requests mic permission and starts metering.
- [ ] Live loudness drives a visible gauge/needle; a burp produces an obvious, satisfying response.
- [ ] Loudness maps to a "burp magnitude" on a Richter-style scale with peak-hold of the best hit.
- [ ] A local leaderboard / best-score persists across reloads (localStorage).
- [ ] A share/result affordance exists (at minimum a copyable result; bonus: Web Share API).

## Robustness
- [ ] Mic **denied** → friendly explanation + a manual/demo fallback, no crash.
- [ ] Mic **unsupported / insecure context** → graceful message, no uncaught errors.
- [ ] No uncaught console errors during a full run (start → burp → result → reset).
- [ ] `requestAnimationFrame` / audio nodes are cleaned up on unmount (no leaks).

## Mobile UX (verified via Playwright emulation, ~390×844 and 320 px width)
- [ ] No horizontal scroll at 320 px; tap targets ≥ 44 px.
- [ ] Renders correctly on emulated iOS Safari and Android Chrome viewports.
- [ ] Playwright run with a **fake/loopback audio stream** drives the meter and reaches a result.

## Shippable
- [ ] Vite `base` set for GitHub Pages; production build serves correctly under a subpath.
- [ ] README has the live HTTPS URL (after `/ship`) and local run instructions.
- [ ] PWA manifest + installability — *nice-to-have, not blocking*.

## Verification notes
- Playwright can grant mic permission and feed audio with Chromium flags:
  `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`
  (optionally `--use-file-for-fake-audio-capture=<wav>` to simulate a loud burp).
- "Done" means the checks above were actually executed and passed in this loop — not that the
  code looks complete.
