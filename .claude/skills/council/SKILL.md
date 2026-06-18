---
name: council
description: Resolve a design/implementation fork by running parallel LLM "seats" that each propose an answer, then vote/synthesise a single verdict — so the autonomous loop decides without interviewing the user. Trigger on "/council", "council this", "which approach", or internally from /oneshot and /implement.
---

# /council — decide a fork without asking the user

When `/oneshot` or `/implement` hits a real decision (mapping curve, layout, data model, library
choice), run a quick internal council instead of stopping to interview the user. The output is a
**single chosen option with a one-line rationale**, recorded in `PRD.md`.

## Procedure
1. **Frame the fork**: a crisp question + 2–4 concrete options, each with a trade-off.
2. **Parallel seats**: spawn 3 subagents (Agent tool, in one message) with *distinct lenses* —
   e.g. **user-delight**, **simplicity/maintainability**, **mobile-robustness**. Each returns its
   pick + 1–2 line reasoning, independently (don't let them see each other).
3. **Aggregate**: tally picks. On consensus, take it. On a split, you (the orchestrator) break the
   tie by the project's priority order: *works-on-a-phone > delight > simplicity > polish*.
4. **Record**: write the verdict + rationale to `PRD.md` and proceed. Don't reopen settled forks.

## Scope & cost
- Use it for **material** forks only — not for every micro-choice (those follow conventions/DoD).
- Seats are quick judgement calls (a few sentences each), not full implementations — keep them cheap.
- Only escalate to the user for facts you genuinely can't infer (e.g. their GitHub username); batch
  those, never interview.
