# Rule: Web-app stack & platform constraints

**Path scope:** `src/**`, `index.html`, `vite.config.*`, `package.json`, `public/**`

The hard constraints that the app must respect — these are *why* the stack was chosen, so
don't quietly drift from them.

## Stack

- **Vite + React + TypeScript + Tailwind.** Strict TS (`tsc --noEmit` must pass). ESLint clean.
- One screen, mobile-first. Design for **320–430 px** wide; treat desktop as a bonus.
- Keep dependencies minimal — every dep must earn its place (see engineering-conduct: simplicity).

## Microphone / Web Audio (the core mechanic)

- Use `navigator.mediaDevices.getUserMedia({ audio: true })` → Web Audio `AnalyserNode`.
  Compute loudness (RMS / peak) per animation frame; smooth it; map to a "burp magnitude".
  Reference patterns: `cwilso/volume-meter`, MDN AnalyserNode.
- **HTTPS is mandatory for mic on a phone.** `getUserMedia` only works on secure contexts;
  `localhost` is exempt but a phone hitting the dev server over the LAN is **not**. The only
  reliable way to demo on a phone is the deployed HTTPS URL (GitHub Pages) — `npm run dev` is
  desktop-only for the mic.
- **Permission UX is part of the product, not an afterthought:** a clear "tap to start / allow
  mic" gate, and a graceful, friendly fallback when the mic is denied or unsupported (don't crash;
  show a manual/demo mode or an explanation). Verification checks both paths.
- Never record or upload audio. All processing is on-device; nothing leaves the phone.

## Quality bar

- Responsive, no horizontal scroll at 320 px, tap targets ≥ 44 px.
- No uncaught console errors. Animations use `requestAnimationFrame`, cleaned up on unmount.
- British English in all UI copy.

## Deployment

- **GitHub Pages** is the default target (HTTPS for free). Set Vite `base` to the repo name so
  asset paths resolve under `https://<user>.github.io/<repo>/`. See the `/ship` skill.
- Vercel is the documented alternative if a root-path URL is preferred.
