---
name: oneshot
description: Build the whole app autonomously from a one-line description. Plans, resolves design forks via an internal council (no user interview), dispatches code generation to Codex, verifies on a mobile viewport with Playwright, and loops fix→verify until the Definition of Done is met. Trigger on "/oneshot", "build the app", "ship it", "make it production ready".
---

# /oneshot — describe once, loop to production

The master skill. The user gives a one-paragraph description; you drive everything to a
production-ready, phone-openable app **without interviewing them**. Codex does the code
generation; you (Claude) orchestrate, verify, and gate. Resolve genuine decisions with
`/council`, never by asking the user.

References: `rules/codex-routing.md`, `rules/web-app.md`, `_shared/codex.md`,
`_shared/definition-of-done.md` (DoD).

## Inputs
- `$ARGUMENTS` = the app description. If empty, use the default brief in `CLAUDE.md`
  (a Richter-style burp-loudness meter) — do **not** stop to ask.

## Procedure

### 0. Lock the brief (no user round-trip)
Write a short `PRD.md` from the description + `CLAUDE.md`: the core mechanic, the screens, and a
copy of the in-scope DoD items. This is the contract every Codex dispatch is held to.

### 1. Resolve design forks with the council, not the user
List the few real decisions (e.g. magnitude mapping curve, single-screen vs. result screen,
gauge visual style, leaderboard shape). For each material fork, invoke **`/council`** to pick.
Record the verdicts in `PRD.md`. Only escalate to the user if a decision needs a real-world fact
you can't infer (e.g. their GitHub username for deploy) — and even then, batch it, don't interview.

### 2. Scaffold (Codex)
If there's no `package.json`, dispatch Codex to scaffold the stack from `rules/web-app.md`
(Vite + React + TS + Tailwind, mobile-first, `vite-plugin-pwa` optional, Vite `base` ready for
Pages). Then `npm install`. Verify `npm run dev` starts and `npm run build` passes before building features.

### 3. Build → verify → loop  (the core)
Decompose the PRD into vertical slices (mic+meter → magnitude+gauge → peak/result → leaderboard →
share → robustness/fallbacks → polish). Then loop:

```
for each slice (and while DoD not fully met):
  1. Dispatch the slice to Codex  (codex exec --full-auto, tight spec + DoD items in scope)   [_shared/codex.md]
  2. GATE (you run it, not Codex):
       npm run build && npx tsc --noEmit && npm run lint
       /verify                      # Playwright mobile + fake mic stream
  3. if green:  git commit -- <changed paths>   (known-good fallback)
     if red:    feed the exact failure output back to Codex and re-dispatch (step 1)
  4. stop the inner retries after ~3 attempts on the same failure → /council a different approach
```

Keep going until **every** DoD box is checked by an actually-executed check. Announce progress
briefly each iteration (slice done, gate result) — don't narrate every command.

### 4. Done gate
Re-run the full DoD once more end-to-end. Update `CLAUDE.md` *Stack/Commands* and `README.md` to
match what was built. Report what's done and what (if anything) is deferred (e.g. PWA polish).

### 5. Ship (only if the user asked, or asks now)
Hand off to **`/ship`** to deploy to GitHub Pages and return the HTTPS URL for the phone. Do not
push/deploy unprompted (`rules/git-workflow.md`).

## Guardrails
- **No interview.** Decisions → council. The user's only required touchpoint is the initial
  description and (if shipping) confirming the GitHub remote/visibility.
- **Verification is the gate**, never Codex's self-report. A slice isn't done until `/verify` is green.
- Commit on every green iteration so a bad Codex turn can't lose progress.
- Hands-off mode: the user can wrap this with the `/loop` command to keep re-entering until done.
