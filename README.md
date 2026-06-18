# Burp Richter Scale 🎤📈

A fun mobile web app: burp into your phone and see how big it registers on a Richter-style
magnitude scale — animated gauge, peak-hold, a local leaderboard, and a shareable result.

> **Status:** harness set up; the app itself is built by running `/oneshot`. Live URL appears here
> after `/ship`.

## Build it

In Claude Code, from this folder:

```
/oneshot "a burp loudness meter: tap to start, allow the mic, burp, and it rates the burp 0–10
on a Richter-style scale with a big animated needle, holds your best score, keeps a local
leaderboard, and lets me share the result. Mobile-first, fun and silly."
```

One skill, no interview. It plans, decides design forks itself (`/council`), generates the code
with **Codex**, verifies on a mobile viewport with **Playwright**, and loops until the
[Definition of Done](.claude/skills/_shared/definition-of-done.md) is met. Then ask it to `/ship`
for an HTTPS link you can open on your phone.

## How the harness works

| Piece | What it does |
|---|---|
| `/oneshot` | Master autonomous loop: describe → build → verify → loop → production. |
| `/implement` | One feature/fix via the same Codex-first build→verify loop. |
| `/council` | Resolves design forks with parallel LLM seats (no user interview). |
| `/verify` | Playwright on a mobile viewport + fake mic stream — the loop's gate. |
| `/ship` | Deploys to GitHub Pages (HTTPS) and returns the phone link. |

Code generation runs on **Codex** (`codex exec`) to keep the build cheap; Claude orchestrates and
verifies. See `.claude/rules/` for stack, routing, and git policy, and
[`.claude/SETUP.md`](.claude/SETUP.md) for the recommended plugins.

## Why HTTPS matters

Microphone access (`getUserMedia`) only works in a secure context. `localhost` is exempt, but a
phone on your network is **not** — so to demo on a phone you need the deployed HTTPS URL, not the
local dev server.

## Local development (desktop)

After the app is scaffolded:

```bash
npm install
npm run dev      # desktop only (phone mic needs the deployed HTTPS URL)
npm run build && npm run preview
```
