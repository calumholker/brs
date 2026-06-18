---
name: implement
description: Implement one well-scoped feature or fix end-to-end via a Codex-first build→verify loop. Trigger on "/implement", "add <feature>", "implement <thing>", "fix <thing>". For the whole app from scratch use /oneshot.
---

# /implement — one feature, Codex-first, verified

A single slice of the build→verify loop that `/oneshot` runs in bulk. Use it for one feature or
bug fix once the app exists. Codex generates; you verify and gate.

References: `rules/codex-routing.md`, `_shared/codex.md`, `_shared/definition-of-done.md`.

## Procedure
1. **Spec it (1–3 lines).** What changes, which files, the `verify:` check that proves it works.
   If there's a real design fork, `/council` it — don't ask the user.
2. **Dispatch to Codex:** `codex exec --full-auto -C "$PWD" "<spec + relevant DoD items + boundaries>"`.
   Surgical scope only. (Tiny one-line edits: just do them directly — faster than spawning Codex.)
3. **Gate (you run it):** `npm run build && npx tsc --noEmit && npm run lint`, then `/verify` for
   anything user-facing.
4. **Loop on red:** paste the exact failure back to Codex and re-dispatch. After ~3 stuck attempts,
   `/council` an alternative approach.
5. **Commit on green** by pathspec, with a descriptive message. Don't push (`rules/git-workflow.md`).

## Done means
The `verify:` check actually ran and passed — not that the diff looks right.
