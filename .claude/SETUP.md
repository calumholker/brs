# Setup — recommended plugins

Researched picks for building this app well (Claude Code plugin marketplace, June 2026). The three
**auto-enabled** ones are declared in `.claude/settings.json` under `enabledPlugins`; when you open
this repo in Claude Code and trust it, you'll be prompted to install them. The rest are optional.

## Auto-enabled (official marketplace, `claude-plugins-official`)

| Plugin | Why it's here |
|---|---|
| `frontend-design` | Anthropic-verified; produces distinctive, production-grade UI instead of generic layouts — makes the "show a friend" app actually look good. |
| `playwright` | Browser automation / e2e MCP (Microsoft). Powers `/verify`: drives the app on a mobile viewport with a fake mic stream. |
| `context7` | Up-to-date library docs (Web Audio, Vite, vite-plugin-pwa) so generated code uses current APIs, not stale ones. |

If an install doesn't appear automatically:

```
/plugin install frontend-design@claude-plugins-official
/plugin install playwright@claude-plugins-official
/plugin install context7@claude-plugins-official
/reload-plugins
```

## Optional

| Plugin / tool | When to add it |
|---|---|
| `ralph-loop@claude-plugins-official` | Generic autonomous Claude-driven loop. Our `/oneshot` is a custom Codex-driven equivalent; install Ralph if you want an off-the-shelf loop to compare. |
| `vercel@claude-plugins-official` | If you deploy to Vercel instead of GitHub Pages (root-path URL, no subpath). |
| `github@claude-plugins-official` | Richer GitHub integration for `/ship` (we use the `gh` CLI by default). |

## Toolchain prerequisites (already present on this machine)
- `codex` ≥ 0.125 (code generation engine) — `codex login` if not authenticated.
- `node` + `npm` (Vite/React build).
- `gh` (GitHub Pages deploy via `/ship`).

## Useful references found during research
- Web Audio loudness patterns: `cwilso/volume-meter`, `domchristie/needles` (EBU R128), MDN AnalyserNode.
- PWA: `vite-pwa/vite-plugin-pwa`.
- Autonomous-loop background: Ralph Wiggum technique (Geoffrey Huntley), Codex `exec` non-interactive mode.
