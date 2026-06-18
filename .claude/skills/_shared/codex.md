# Shared: dispatching code generation to Codex

`codex exec` runs Codex non-interactively in the current repo. This is the default engine for
code generation (see `rules/codex-routing.md`). Codex CLI ≥ 0.125.

## Invocation

```bash
codex exec --full-auto -C "$PWD" "<tight spec>"
```

- `--full-auto` — low-friction sandboxed auto-execution (Codex may read/write the workspace and
  run commands without prompting). Equivalent to `--sandbox workspace-write` with auto-approval.
- `-C, --cd <DIR>` — run in the project dir (pass the repo root).
- `-m, --model <MODEL>` — override model for a harder task if needed.
- Pipe extra context on **stdin**; it's appended as a `<stdin>` block:
  `cat verify-failures.txt | codex exec --full-auto -C "$PWD" "Fix these failures:"`
- `--json` — emit JSONL events if you need to parse Codex's actions programmatically.
- Prefer `--full-auto` over `--dangerously-bypass-approvals-and-sandbox` (the latter has no
  sandbox; only for already-isolated environments).

## How to brief Codex (this matters more than flags)

Codex performs best with a **discrete, well-scoped task + explicit success criteria**, not a vague
ask. Every dispatch should include:

1. **What to build/fix** — one concrete deliverable.
2. **The contract** — files to touch, the stack (`rules/web-app.md`), British-English UI copy.
3. **The verification it must satisfy** — quote the Definition of Done items in scope, and when
   fixing, paste the actual failing output (build error, tsc error, Playwright log).
4. **Boundaries** — surgical changes only; don't restructure unrelated code.

Example fix dispatch:

```bash
printf '%s\n' "$BUILD_LOG" | codex exec --full-auto -C "$PWD" \
  "The production build fails (log on stdin). Fix the root cause only. Constraints: keep the
   Vite+React+TS+Tailwind stack, strict tsc must pass, no new deps unless essential. After
   fixing, ensure 'npm run build' and 'npx tsc --noEmit' both succeed."
```

## After every dispatch

Claude (not Codex) runs the gate: `npm run build`, `npx tsc --noEmit`, `npm run lint`, and the
Playwright mobile check. Codex's claim of success is never the gate — the verification is.
Commit on green. Loop on red with the failure fed back in.
