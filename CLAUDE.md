# CodeShelf — Project Context

## What This Is

**CodeShelf** is a localhost GitHub repository review and management tool.

It helps developers inspect all their GitHub repositories — public and private — score them locally for portfolio quality and cleanup priority, optionally run AI analysis on public repos, and manage visibility or deletion with an explicit warning/confirmation flow.

This is not a SaaS app. This is not a hosted service. This is a local developer utility. Do not deploy it publicly.

---

## Stack

| Layer | Decision |
|---|---|
| Frontend | Angular 22 standalone components, signals, OnPush |
| Backend | Node/Express (plain JS, ESM) — exists only to keep secrets out of the browser |
| Database | None — no MongoDB, no Postgres, no Redis |
| Auth | GitHub Personal Access Token in `.env` only |
| AI | Adapter pattern, env-driven provider, backend-only API calls |
| Storage | None — no browser storage, no persistence layer |

The backend is not a product backend. It is a small server-side boundary for secrets. It has no database, no user accounts, and no sessions. Keep it thin — do not abstract it into something it does not need to be.

---

## Architecture

```
GitHub API
  -> Express backend (backend/src/)
       routes/    — health, github (read + write actions), ai
       services/  — github.service.js (token, pagination, GitHub calls)
       utils/     — sanitize.js (whitelist-only field mapping)
       ai/        — provider adapters (mock, openai, anthropic, ollama)
  -> sanitized SafeGitHubRepo[] JSON
  -> Angular frontend (frontend/src/app/)
       core/services/  — thin HTTP services
       core/utils/     — repo-classifier.utils.ts, repo-score.utils.ts (pure functions)
       features/       — repos (dashboard + action flows), setup, how-it-works
       shared/         — repo-card, badges, state components
```

- The frontend never calls GitHub directly and never sees the token.
- All GitHub responses pass through the whitelist sanitizer ([backend/src/utils/sanitize.js](backend/src/utils/sanitize.js)) — raw GitHub API objects are never forwarded.
- **Classification runs before scoring.** `classifyRepo()` assigns a repo type (profile repo, portfolio project, fork, template, config/dotfiles, archived, experiment, …), then a type-specific scorer produces portfolio, cleanup, activity, and completeness scores plus suggestions.
- The profile repo (name matches the owner's login) is protected: cleanup score is 0, delete suggestions never fire, and its delete checkbox is disabled.
- Public/private lists are derived from the `private` field (`repos.filter(...)`) — never stored separately.

---

## User Flow

1. User opens app — setup screen shows status indicators (token, GitHub user, AI provider, rate limit)
2. Setup screen explains `.env` requirements and links to GitHub token settings — never shows a token input, never displays the token value
3. Dashboard loads all repos via the local backend — Public and Private sections as cards with checkboxes
4. Local rule-based scoring and suggestion badges appear on every card
5. **Analyse Public Repos** (optional) — AI rates public repos only; results are advisory badges
6. User manually selects repos and chooses an action (make private, make public, or user-selected mass delete behind a session-only safety toggle)
7. Warning screen lists exactly what will happen, with disclaimer — explicit confirmation required
8. Action executes via the backend, sequentially; per-repo results are shown

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

- AI calls happen in the backend only.
- The backend filters to `private === false` before any repo reaches a provider — enforced in backend code ([backend/src/routes/ai.routes.js](backend/src/routes/ai.routes.js)), not just the UI.
- AI prompts receive a stripped, AI-safe field subset of public repo metadata only.
- `AI_PROVIDER` unset, `none`, or unrecognised means AI is **disabled**: the analyse route returns 503 and the UI greys out the button. The mock provider runs only when explicitly set to `mock`.
- AI never receives the GitHub token or any `.env` value.
- AI never triggers GitHub actions, never selects repos, never calls write endpoints.
- AI is advisory only — the user decides and confirms everything.

---

## Token Scope

| Need | Fine-grained PAT | Classic PAT |
|---|---|---|
| Read metadata only | Metadata — read-only | `repo` (overpowered but works) |
| Visibility changes | Administration — read/write | `repo` |
| Deletion | Administration — read/write | `repo` + `delete_repo` |

Fine-grained PAT is the recommended default. Classic `repo` is a fallback — it grants more access than CodeShelf actually uses.

---

## Security Rules

- Bind Express server to `127.0.0.1` only
- Restrict CORS to `http://localhost:4200` (Angular dev port)
- Never log the token
- Never return the token to the frontend
- Never include the token in error messages
- Return sanitized GitHub errors — not raw upstream error objects
- Whitelist response fields — do not forward full GitHub API objects
- Write/delete routes require the `X-CodeShelf-Action` header and execute sequentially
- Never commit `.env`

---

## Agent Rules

1. Do not add OAuth.
2. Do not add a database or any browser persistence.
3. Do not move the token or AI keys into Angular.
4. Do not add large dependencies without asking.
5. Do not send private repos to external AI — enforce `private === false` in backend code, not just UI.
6. Do not let AI trigger write or delete actions, ever.
7. Deletion stays user-selected only: session-only UI safety toggle, confirmation screen, sequential execution, no select-all-delete, no AI preselection.
8. Do not skip or weaken any warning/confirmation screen.
9. Do not change the architecture without updating this file.
10. Take the narrow interpretation of any request — do not silently expand scope. If docs and code conflict, stop and ask.
11. Report files changed, assumptions made, validation performed, and blockers.

---

## Where Things Live

```
codeshelf/
├── CLAUDE.md             ← this file
├── AGENTS.md             ← agent routing
├── frontend/             ← Angular app
├── backend/              ← Express API
├── docs/                 ← public docs: architecture, scoring, security, troubleshooting, demo, screenshots
├── .env.example          ← all keys documented, values empty
├── README.md
└── package.json          ← npm run dev starts both servers
```

Maintainer note: a `docs/` folder may exist locally — it is gitignored, private build context, and not part of the public repository. Do not reference it from tracked files.
