# Rule: Engineering conduct

**Path scope:** `**` (all code work)

Behavioural guidelines for writing/changing code, adapted from karpathy's CLAUDE.md
(multica-ai/andrej-karpathy-skills). Biases toward caution over speed — for trivial
changes, use judgement.

## Think before coding

Don't assume. Don't hide confusion. Surface trade-offs *before* implementing.

- State assumptions explicitly. In the autonomous `/oneshot` loop, resolve genuine forks
  with `/council` rather than guessing or stopping to ask the user.
- If a simpler approach exists, take it. No speculative abstractions.

## Simplicity first

Minimum code that solves the problem. Nothing speculative.

- No features beyond the spec; no abstractions for single-use code; no config that wasn't asked for.
- If 200 lines could be 50, rewrite it. "Would a senior engineer call this overcomplicated?"
- This is a fun one-screen app — resist enterprise scaffolding.

## Surgical changes

Touch only what you must. Clean up only your own mess.

- Don't "improve" adjacent code or refactor what isn't broken; match the surrounding style.
- Remove imports/vars your change orphaned; leave pre-existing dead code unless asked.
- Every changed line traces directly to the task.

## Goal-driven execution

Define success criteria, then loop until verified — "it builds" is not "it works".

- Turn tasks into verifiable goals with a concrete `verify:` check (build passes, type-check clean,
  Playwright mobile flow green, no console errors). See `_shared/definition-of-done.md`.
- A change is done only when its verification actually ran and passed — not when the code looks right.

---

**Working if:** fewer unnecessary diff lines, fewer rewrites from overcomplication, and the loop
exits because the Definition of Done is genuinely met.
