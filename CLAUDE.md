# CLAUDE.md — Burp Richter Scale

A fun **mobile web app**: measure how loud a burp is and rate it on a Richter-style
magnitude scale, with an animated gauge, peak-hold, a local leaderboard, and a shareable
result. Built to be opened from a phone and shown to a friend. `AGENTS.md` symlinks here
so Codex reads the same spec.

**Status:** harness only — the app is built by running `/oneshot` (see below). When the app
exists, update this file's *Stack* and *Commands* to match what was actually built.

## How this project gets built

You describe it once; one skill loops autonomously to production. **No interview.**

```
/oneshot "<one-paragraph description of the burp richter app you want>"
```

`/oneshot` plans → resolves design forks itself via an internal `/council` (LLM seats, not
user questions) → scaffolds → dispatches code generation to **Codex** → verifies with
Playwright on a mobile viewport → loops fix→verify until the Definition of Done is met →
deploys to an HTTPS URL you can open on your phone. For a single feature use `/implement`.

## Stack (decided — the oneshot targets this)

- **Vite + React + TypeScript + Tailwind**, mobile-first (target 320–430 px).
- **Web Audio API** (`getUserMedia` + `AnalyserNode`) for mic loudness → mapped to a playful
  "burp magnitude". Must degrade gracefully when the mic is denied/unsupported.
- **PWA** (installable, offline shell) via `vite-plugin-pwa` — nice-to-have, not blocking.
- **Deploy: GitHub Pages** over HTTPS (mic access *requires* HTTPS on a phone — `localhost`
  is exempt but a phone on the LAN is not). Vercel is the documented alternative.

## Agent routing (cost-aware)

- **Code generation → Codex** (`codex exec`). Burns the ChatGPT Plus pool, not Claude credits.
  Invocation patterns + flags: `.claude/skills/_shared/codex.md`.
- **Orchestration, verification, design judgement → Claude (this session).** Cheap while you're
  already here; keeps whole-context awareness.
- **Design forks → `/council`** (parallel LLM seats pick + vote) — never stop to interview the user.
- **Verification → Playwright** (mobile-emulated, fake mic stream). Definition of Done lives in
  `.claude/skills/_shared/definition-of-done.md`.

## Commands (once the app is scaffolded)

```bash
npm install            # deps
npm run dev            # local dev (desktop only — phone mic needs the deployed HTTPS URL)
npm run build          # production build
npm run preview        # serve the build
npm run lint           # eslint
npx tsc --noEmit       # type check
```

## Conventions

British English in all prose/comments/UI copy (`colour`, `optimise`, `behaviour`). Mobile-first.
Full conventions, the package/dev boundary, and git policy live in `.claude/rules/` (read the one
matching what you're touching). Behavioural coding conduct: `.claude/rules/engineering-conduct.md`.

## Do not

- Never `git push` or deploy without the user asking (new repo; treat remote as off by default).
- Don't interview the user to build the app — that's what `/oneshot` + `/council` are for.
- Don't hand-write the app from this session — dispatch generation to Codex.
