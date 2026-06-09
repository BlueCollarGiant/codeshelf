# AGENTS.md

This file exists to route any AI agent — regardless of platform — to the right starting point.

## Start Here

Read `CLAUDE.md` at the project root before doing anything else.

`CLAUDE.md` contains:
- What CodeShelf is and what it is not
- The full stack decision
- Security rules and token safety constraints
- The build order and phase system
- Agent rules — what you must never do
- Library references — which docs to read for which phase

## Do Not Start Coding

Do not scaffold, generate files, or install packages until you have:

1. Read `CLAUDE.md` completely
2. Read `docs/planning-roadmap.md`
3. Read `docs/build-phases.md`
4. Confirmed which phase to work on with the developer

## Platform Notes

| Platform | Where to find instructions |
|---|---|
| Claude Code | `CLAUDE.md` loads automatically |
| Cursor | Read `CLAUDE.md` manually at session start |
| GitHub Copilot | Read `CLAUDE.md` manually at session start |
| Codex | Paste the session start prompt from `docs/agent-prompts.md` |
| Any other agent | Read `CLAUDE.md` first — everything else follows from it |

## Quick Reference

| Need | File |
|---|---|
| Full product plan | `docs/planning-roadmap.md` |
| Current phase scope | `docs/build-phases.md` |
| Agent prompts | `docs/agent-prompts.md` |
| Design tokens | `frontend/src/styles/tokens.css` |
| Design rationale | `docs/design-rationale.md` |
| Security rules | `CLAUDE.md` → Security Rules section |
| Library rules | `docs/library/` |
