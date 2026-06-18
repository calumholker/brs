# PRD — Burp Richter Scale

A fun, **funny**, production-quality mobile web app. Burp into the phone; it measures mic
loudness and rates the burp on a Richter-style 0–10 magnitude scale, with an animated needle
dial, a live seismograph waveform, peak-hold, a local leaderboard, and a shareable result.
Target: open on an **iPhone 12 (iOS Safari, HTTPS)** and show a friend. Stack per
`.claude/rules/web-app.md` (Vite + React + TS + Tailwind, mobile-first 320–430px).

## Core mechanic
- Tap **Start** → (inside the same gesture) resume `AudioContext` + `getUserMedia({audio:true})`
  → `AnalyserNode`. Compute loudness per `requestAnimationFrame` (RMS → dB), smooth it.
- Map loudness → **burp magnitude 0–10** logarithmically (Richter feel; see mapping below).
- Live needle dial + live seismograph waveform strip react in real time. Peak-hold captures the
  best instant of the burp. On stop/settle, the result reveals with a dramatic beat.

## Design decisions (council verdicts — settled, do not reopen)
- **Gauge (A):** primary = big **radial needle Richter dial** (SVG/CSS transforms, GPU-friendly).
  Secondary = lightweight **live seismograph waveform strip** (single canvas polyline) for the
  on-theme joke. Both driven by the same analyser data.
- **Mapping (B):** **logarithmic** dB→magnitude. Calibrate so ambient/room noise reads ~0–2, a
  normal burp ~4–6, a heroic burp ~8–9; **10 is hard to reach**. Clamp 0–10. Tune constants so it
  feels earned (e.g. map a dB floor→0 and a dB ceiling→10 with a log/perceptual curve).
- **Flow (C):** **single screen**. Result animates in with a reveal beat (no route change → no
  iOS AudioContext-teardown stutter). User keeps watching the needle as it peaks.
- **Leaderboard (D):** **top-N (10)** local leaderboard in `localStorage`: editable burper name,
  magnitude, earned funny title, timestamp. Persists across reloads. Sorted by magnitude.
- **Funny layer (E) — build these:**
  - Per-magnitude **band labels** (British-English, escalating + silly), e.g.
    "1.2 — A polite hiccup", "4.5 — Felt by next of kin", "6.8 — Windows rattle",
    "8.7 — Tectonic event", "9.5+ — The Big One / evacuate the building".
  - **Earned rank/title** per result (the shareable punchline, e.g. "The Gastric Godzilla").
  - **3·2·1 BURP** countdown before metering arms (pure JS/CSS, builds anticipation).
  - **CSS screen-shake** on big burps (visual only — **no haptic promise**, iOS lacks vibrate).
  - **Demo / fake-burp mode** when mic denied/unsupported (always playable + funny).
  - **Share**: `navigator.share` (text+URL) with **clipboard copy fallback**. No canvas image.
  - Cut (scope/perf/iOS): confetti, aftershock detection, duration readout, canvas-image share.

## iOS / mobile constraints
- `audioCtx.resume()` **inside the same tap handler** as `getUserMedia` (iOS suspends otherwise).
- 60fps: prefer SVG/CSS transforms for the dial; keep the waveform canvas a single cheap polyline.
- HTTPS mandatory for mic on a phone; `npm run dev` is desktop-only. Secure-context check → if
  insecure/unsupported, show graceful message + demo mode.
- No horizontal scroll at 320px; tap targets ≥44px; British-English UI copy.

## Definition of Done
The in-scope items from `.claude/skills/_shared/definition-of-done.md` (build/tsc/lint clean;
mic→gauge→magnitude→peak-hold→leaderboard→share; mic-denied & unsupported fallbacks; no uncaught
console errors; mobile 320/390px; Playwright fake-mic run reaches a result; Vite `base` set for
Pages). PWA installability is nice-to-have, not blocking.
