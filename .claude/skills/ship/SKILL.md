---
name: ship
description: Deploy the built app to an HTTPS URL openable on a phone (GitHub Pages by default; Vercel alternative) and return the link. Requires explicit user go-ahead — confirms the GitHub remote/visibility first. Trigger on "/ship", "deploy", "put it online", "give me the phone link".
---

# /ship — get an HTTPS link for the phone

The mic only works over HTTPS on a phone, so "show a friend" means deploying. Default target is
**GitHub Pages** (free HTTPS). **Push/deploy is opt-in** — confirm with the user before any remote
operation (`rules/git-workflow.md`).

## Preconditions
- DoD is green (`/verify` passed). `gh` is authenticated (`gh auth status`).
- Ask the user once (batched): create the GitHub repo as **public or private**, and the repo name
  (default: a slug of the folder, `burp-richter-scale`).

## GitHub Pages procedure
1. **Vite base:** ensure `vite.config.ts` has `base: '/<repo>/'` so assets resolve under the Pages
   subpath. Rebuild and re-`/verify` the built app under that base.
2. **Repo + remote:** `gh repo create <repo> --<public|private> --source=. --remote=origin --push`
   (this is the first push — only after user go-ahead).
3. **Pages via Actions:** add a Pages deploy workflow (`actions/deploy-pages`) that builds and
   publishes `dist/`, then enable Pages (`gh api ... --field build_type=workflow` or repo settings).
4. **URL:** the site lands at `https://<user>.github.io/<repo>/`. Wait for the Actions run to go
   green, then **open the URL on the phone and confirm the mic prompt appears**.
5. **README:** write the live URL into `README.md`.

## Alternative — Vercel
If a root-path URL is preferred: `npx vercel` (interactive login the user runs once), set Vite
`base: '/'`. Vercel gives an HTTPS `*.vercel.app` URL with no subpath.

## Output
The HTTPS link (and the QR/short instructions to open it on a phone), plus confirmation the mic
permission prompt works on the live site.
