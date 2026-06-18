# Rule: Agent routing (Codex-first codegen)

**Path scope:** `**`

Who does what, and why. The point is to do the heavy code generation on **Codex** (ChatGPT
Plus pool) while Claude orchestrates — keeping the build cheap and hands-off.

| Work | Agent | Why |
|---|---|---|
| **Code generation** — scaffolding, components, refactors, fixing failures | **Codex** (`codex exec`) | Burns the ChatGPT Plus pool, not Claude credits. Best at discrete, well-specified codegen. |
| Orchestration, planning, reading failures, deciding next step | **Claude** (this session) | Cheap while interactive; holds whole-context awareness; drives the loop. |
| Design forks (layout, scale mapping, data model choices) | **`/council`** | Parallel LLM seats pick + vote → a decision, so the loop never stops to interview the user. |
| Verification (does it actually work on a phone-sized screen?) | **Playwright** (via Claude) | Mobile-emulated, fake mic stream, screenshots. Gates the loop. |

## Rules

- **Dispatch generation to Codex by default.** Claude writes code directly only for tiny,
  surgical edits where spawning Codex would be slower than just doing it.
- **Codex gets a tight spec + the Definition of Done**, not a vague ask. Give it the failing
  verification output to fix against. Patterns + flags: `_shared/codex.md`.
- **Claude owns the loop and the gate.** Codex proposes; Claude verifies and decides whether the
  DoD is met. Never mark done on Codex's say-so alone — run the verification.
- This is greenfield with automated verification — the ideal case for an autonomous loop.
