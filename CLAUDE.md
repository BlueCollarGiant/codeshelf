# CodeShelf — Project Context

## STOP — Read Before Building Anything

**Do not scaffold. Do not generate files. Do not install packages. Read this file first.**

If you are an AI agent starting a new session on this project:

1. Read this file completely before taking any action.
2. Read `docs/planning-roadmap.md` for the full plan.
3. Read `docs/build-phases.md` to find the current phase.
4. Ask the user which phase to work on if it is not clear.
5. Work only on the requested phase. Do not work ahead.

---

## How To Start A Session

Paste this at the start of any new agent session:

```
Read CLAUDE.md at the project root before doing anything else.
Then read docs/planning-roadmap.md and docs/build-phases.md.
Do not scaffold, generate files, or install packages until you confirm:
- Which phase we are on
- What the current phase goal is
- What files are in scope for this phase
Ask me before proceeding.
```

---

## What We Are Building

**CodeShelf** is a localhost GitHub repository review and management tool.

It helps developers inspect all their GitHub repositories — public and private — use AI to rate their public repos, and manage visibility and cleanup with a clear action flow.

This is not a SaaS app. This is not a hosted service. This is a local developer utility.

---

## Stack

| Layer | Decision |
|---|---|
| Frontend | Angular 22 standalone, Angular Material approved |
| Backend | Node/Express — exists only to keep secrets out of the browser |
| Database | None — no MongoDB, no Postgres, no Redis |
| Auth | GitHub Personal Access Token in `.env` only |
| AI | Adapter pattern, env-driven provider, backend-only API calls |
| Storage | localStorage for dismiss/ignore state only |

The backend is not a product backend. It is a small server-side boundary for secrets. It has no database, no user accounts, and no sessions.

---

## User Flow (locked)

1. User opens app — sees welcome/setup screen with status indicators
2. Setup screen explains `.env` requirements, links to GitHub token settings
3. Once token is valid, user loads all repos — shown in Public and Private sections as cards with checkboxes
4. User clicks **Analyse Public Repos** — AI rates public repos only on skill, professionalism, suggests deletion/private
5. User manually selects repos with checkboxes, chooses action (make private, make public, user-selected mass delete)
6. Warning screen shows exactly what will happen and disclaimer
7. User confirms — action executes via GitHub API
8. Users can dismiss/ignore suggestions per repo — stored in localStorage

---

## Planning Docs — Read In This Order

All planning docs are in `docs/`. When docs conflict, earlier in this list wins.

1. `docs/planning-roadmap.md` — full product plan, architecture, models, rules
2. `docs/build-phases.md` — phase definitions, acceptance criteria, cut rules
3. `docs/agent-prompts.md` — per-phase prompts and guardrails

---

## Build Order

Work one phase at a time. Do not work ahead.

| Phase | Focus |
|---|---|
| 1 | Project structure, open-source shell, `.env.example`, README skeleton |
| 1.5 | Design tokens — `tokens.css`, palette locked, rationale doc |
| 2 | Static Angular UI with fake repo fixture data — all values from `tokens.css` |
| 3 | Express backend — health, GitHub service, `/api/github/me`, `/api/github/repos` |
| 4 | Connect Angular to backend — real GitHub data |
| 5 | Local rule-based analysis — scoring, suggestions, badges |
| 6 | AI adapter — public repos only, env-driven provider, advisory results |
| 7 | Write actions — visibility changes with warning/confirmation flow |
| 7b | Write actions — user-selected mass deletion with UI toggle safety + confirmation |
| 8 | Open source polish — README, screenshots, GIF, docs |

---

## Token Safety

The GitHub token and AI API keys must only exist in:

```
.env
process.env.GITHUB_TOKEN
process.env.OPENAI_API_KEY
process.env.ANTHROPIC_API_KEY
```

Never in:
- Angular environment files
- Browser localStorage or sessionStorage
- Frontend state
- Console logs
- API responses
- AI prompts
- Committed files

---

## AI Boundary (non-negotiable)

- AI only receives repos where `private === false`
- This must be enforced in backend code, not just the UI
- AI never receives the GitHub token
- AI never receives `.env` values
- AI never triggers GitHub actions
- AI is advisory only — the user decides and confirms everything

---

## Token Scope

| Need | Fine-grained PAT | Classic PAT |
|---|---|---|
| Read metadata only (MVP) | Metadata — read-only | `repo` (overpowered but works) |
| Visibility changes | Administration — read/write | `repo` |
| Deletion (Phase 7b) | Administration — read/write | `repo` + `delete_repo` |

Fine-grained PAT is the recommended default. Classic `repo` is a fallback — document that it grants more access than CodeShelf actually uses.

---

## Security Rules

- Bind Express server to `127.0.0.1` only
- Restrict CORS to `http://localhost:4200` (Angular dev port)
- Never log the token
- Never return the token to the frontend
- Never include the token in error messages
- Return sanitized GitHub errors — not raw upstream error objects
- Whitelist response fields — do not forward full GitHub API objects
- Never commit `.env`

---

## Library References

These docs from the shared library apply to this build. Read them when working on the relevant phase — do not skip them.

| Phase | Read this | Why |
|---|---|---|
| All phases | `library/scaffold-before-code.md` | Do not generate code before the current phase spec is confirmed |
| All phases | `library/report-gaps-explicitly.md` | Stop and ask when something is missing — do not invent values |
| All phases | `library/secrets-management.md` | Token and key handling checklist — reinforces the Token Safety section above |
| All phases | `library/preserve-developer-control.md` | Agents must not silently expand scope, make structural decisions, or resolve contradictions unilaterally — take the narrow interpretation and confirm |
| All phases | `library/yagni.md` | Do not build for hypothetical future requirements — if the current phase spec does not require it, do not add it |
| All phases | `library/kiss.md` | Prefer the simplest solution that works — the Express backend is intentionally thin, do not abstract it into something it does not need to be |
| All phases | `library/dry.md` | Every piece of knowledge has one authoritative representation — constants, header names, endpoint paths defined once and imported everywhere |
| All phases | `library/anti-patterns.md` | Recurring bad habits to avoid — silently swallowing errors, leaking internals across boundaries, testing mocks instead of behavior |
| All phases | `library/single-responsibility.md` | Each unit has one reason to change — route handlers own input/response, services own business logic, keep them separate |
| All phases | `library/separation-of-concerns.md` | Different concerns belong in different layers — handler, service, repository, utility, component each own their layer only |
| Phase 6+ | `library/dependency-inversion.md` | Depend on contracts not concrete implementations — the AI adapter pattern is this principle applied |
| Phase 5+ | `library/open-closed.md` | Open for extension, closed for modification — new suggestion rules and AI providers plug in without editing the engine |
| Phase 1 | `library/monorepo-foundation.md` | Repo structure, root scripts, proxy config, env loader, health check pattern |
| Phase 2+ | `library/stack-constraints.md` | Angular rules: standalone components, signals, OnPush, no NgModules, no `*ngIf`/`*ngFor`, no `any`, inject() over constructor injection |
| Phase 3+ | `library/testing-rules.md` | Jest (backend) + Vitest (Angular) — what must be tested, test structure, fixtures, and the critical path checklist for token safety, AI boundary, and write/delete actions |
| Phase 3 | `library/api-response-conventions.md` | Error envelope shape, HTTP status codes, controller/service split for the Express backend |
| Phase 3 | `library/api-boundaries.md` | Sanitized response shapes, no GitHub API internals leaking to frontend, consistent field names |
| Phase 4+ | `library/http-lifecycle.md` | `firstValueFrom()` vs `httpResource()` vs `.subscribe()` — use the decision table before picking a pattern for any HTTP call |
| Phase 4+ | `library/state-ownership.md` | Angular signal ownership — publicRepos/privateRepos are derived from source, not stored separately; dismiss/ignore lives in localStorage only |

**Not applicable to this build:** api-object-level-authorization (no multi-user auth), service-boundaries (backend is intentionally thin), feature-first-structure (folder structure is pre-defined in planning-roadmap.md), marketing-site, booking-system, seo rules.

---

## Pack Extraction Note

This pack (`packs/git_tool/`) is temporary. It lives here during planning only and will be deleted from this repo once the CodeShelf repository is created.

When extracting:
- All docs in `packs/git_tool/` move to `docs/` in the new CodeShelf repo
- `CLAUDE.md` moves to the project root of the new repo
- `design-tokens.css` moves to `frontend/src/styles/tokens.css`
- `design-rationale.md` moves to `docs/design-rationale.md`
- This pack folder is then deleted from `service-site-blueprints`
- Create `AGENTS.md` at the CodeShelf repo root pointing to `CLAUDE.md` — this ensures agents on any platform (Cursor, Copilot, etc.) land in the right place

---

## Conflict Resolution Rule

If any two documents in this project contradict each other, **stop and ask the user** before proceeding. Do not resolve conflicts by picking the document that permits more work. Do not use `planning-roadmap.md` feature lists as permission to build things outside the current phase. `build-phases.md` is the source of truth for what is in scope right now.

## Agent Rules

1. Do not add OAuth.
2. Do not add a database.
3. Do not move the token or AI keys into Angular.
4. Do not add large dependencies without asking.
5. Do not create unnecessary folders.
6. Do not build write actions before Phase 7.
7. Do not build AI before Phase 6.
8. Do not send private repos to external AI — enforce `private === false` in backend code, not just UI.
9. Do not add a delete route or delete UI before Phase 7b. In Phase 7b, deletion is user-selected mass delete — gated behind a UI toggle in the action controls bar (session-only, resets on reload). Confirmation screen required. Sequential execution. No AI preselection. No select-all-delete. No env flag required — the UI toggle is the safety gate.
10. Do not change the architecture without updating `planning-roadmap.md`.
11. Work only on the requested phase. Do not work ahead.
12. The frontend responsibilities list in `planning-roadmap.md` is a total product list — it is not current phase permission. Current phase scope comes from `build-phases.md` only.
13. Report files changed, assumptions made, validation performed, and blockers.
14. Do not migrate to Analog.js — that is a later exploration track only.
15. If any documents conflict, stop and ask. Do not resolve conflicts silently.

---

## Where Files Live After Extraction

```
codeshelf/                ← new repo root
├── CLAUDE.md             ← this file, at root
├── AGENTS.md             ← agent routing, at root
├── frontend/             ← Angular app
├── backend/              ← Express API
├── docs/                 ← all planning docs go here
│   ├── planning-roadmap.md
│   ├── build-phases.md
│   ├── agent-prompts.md
│   ├── security.md
│   └── screenshots.md
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

CLAUDE.md must be at the project root. Do not put it inside `docs/`.
