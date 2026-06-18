# Burp Richter Scale

A fun mobile web app: burp into your phone and see how big it registers on a Richter-style
magnitude scale — animated gauge, peak-hold, a local leaderboard, and a shareable result.

> **Status:** app scaffolded and implemented. Live URL appears here after `/ship`.

## Local development

Install dependencies, then run the Vite dev server:

```bash
npm install
npm run dev
```

The local dev server is desktop-only for the real microphone path. To open it on a phone with mic
access, deploy to HTTPS, for example with GitHub Pages.

## Checks

```bash
npm run build
npx tsc --noEmit
npm run lint
```

## Why HTTPS matters

Microphone access (`getUserMedia`) only works in a secure context. `localhost` is exempt, but a
phone on your network is **not** — so to demo on a phone you need the deployed HTTPS URL, not the
local dev server.
