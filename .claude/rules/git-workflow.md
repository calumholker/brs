# Rule: Git workflow

**Path scope:** `**`

## Commit discipline

- Commit after every green iteration (build + type-check + verification pass), so the loop always
  has a known-good fallback. Descriptive messages.
- Commit by pathspec (`git commit -- <paths>`) when other work may be staged; add new files
  explicitly first (never `git add -A`).
- Don't commit `node_modules/`, `dist/`, `.env`, or build output (see `.gitignore`).
- Attribute commits to the user only — no AI co-author trailer.

## Push / deploy = explicit opt-in

- **Never `git push`, create a remote, or deploy without the user explicitly asking.** This is a
  fresh local repo; treat remote as OFF by default. A PreToolUse hook warns on push/deploy.
- When the user does ask to ship: `/ship` creates/uses the GitHub remote, enables Pages, and
  returns the phone-openable HTTPS URL. Confirm the remote/visibility with the user first.
