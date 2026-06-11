# Architecture

CodeShelf is two small apps run together: an Angular frontend and a thin Express backend. The backend exists for exactly one reason: to keep the GitHub token and AI API keys out of the browser.

```
GitHub API
   │  (token attached server-side only)
   ▼
Express backend  (http://127.0.0.1:3000)
   │  whitelist sanitizer: raw GitHub objects never leave the backend
   ▼
Angular frontend (http://localhost:4200)
   │  signals + pure scoring functions
   ▼
Repo cards, scores, suggestion badges, action flows
```

- The frontend never calls GitHub directly and never sees the token.
- There is no database and no browser storage. All state is in-memory per session.
- Everything runs on localhost. Do not deploy this publicly; see [security.md](security.md).

---

## Repository Layout

```
codeshelf/
├── frontend/                 Angular 22, standalone components, signals, OnPush
│   └── src/app/
│       ├── core/
│       │   ├── models/       SafeGitHubRepo, RepoScore, RepoSuggestion, RepoType, ...
│       │   ├── services/     repo-api, ai-api, repo-actions (thin HTTP wrappers)
│       │   └── utils/        repo-classifier.utils.ts, repo-score.utils.ts (pure functions)
│       ├── features/
│       │   ├── repos/        dashboard, action bars, warning/confirm/result screens
│       │   ├── setup/        status indicators + .env instructions
│       │   └── how-it-works/ in-app explanation of scoring
│       └── shared/           repo-card, badges, stat cards, loading/empty/error states
├── backend/
│   └── src/
│       ├── server.js         binds 127.0.0.1, CORS locked to localhost origins
│       ├── config/env.js     loads .env from the repo root
│       ├── routes/           health, github, ai
│       ├── services/         github.service.js: token, pagination, GitHub calls
│       ├── utils/sanitize.js whitelist-only field mapping
│       ├── middleware/       error handler ({ success: false, message })
│       └── ai/               provider adapters: mock, openai, anthropic, ollama
├── docs/                     public documentation (this folder)
├── .env.example              every variable documented
└── package.json              npm run dev starts both servers via concurrently
```

The backend is plain JavaScript (ESM) with no build step; it runs via `node --watch src/server.js`. The frontend is a standard Angular CLI app.

---

## Environment Variables

All configuration lives in a single `.env` at the repo root. See [.env.example](../.env.example).

| Variable | Required | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | Yes | GitHub Personal Access Token. Server-side only. |
| `PORT` | No (default 3000) | Backend port. |
| `ALLOWED_ORIGIN` | No (default `http://localhost:4200`) | CORS origin for the Angular dev server. Must be a localhost origin; non-localhost values are rejected and the default is used. |
| `AI_PROVIDER` | No (default disabled) | `openai`, `anthropic`, `ollama`, `mock`, or `none`. Unset, `none`, or any unrecognised value disables AI entirely. |
| `OPENAI_API_KEY` | Only if `AI_PROVIDER=openai` | |
| `ANTHROPIC_API_KEY` | Only if `AI_PROVIDER=anthropic` | |
| `OLLAMA_URL` | Only if `AI_PROVIDER=ollama` (default `http://localhost:11434`) | |
| `OLLAMA_MODEL` | Only if `AI_PROVIDER=ollama` (default `llama3`) | |

---

## Backend API

All responses are JSON. Errors use a consistent envelope: `{ "success": false, "message": "..." }` with an appropriate HTTP status. Error messages are hand-written and sanitized; raw GitHub error objects, headers, and the token never appear in any response.

### Read endpoints

| Endpoint | Returns |
|---|---|
| `GET /api/health` | `{ status: "ok", timestamp }` |
| `GET /api/github/status` | `{ tokenPresent, tokenValid, rateLimitRemaining, rateLimitReset, scopes }`, never the token value |
| `GET /api/github/me` | `{ login, name, avatarUrl, profileUrl }` |
| `GET /api/github/repos` | `SafeGitHubRepo[]`, all repos via paginated `GET /user/repos` |
| `GET /api/ai/status` | `{ provider, configured }` |

### Write endpoints

Write routes require a custom header as a deliberate-action gate. Requests without it are rejected with 400. Execution is always **sequential**, never parallel, with a per-repo result.

| Endpoint | Header | Body |
|---|---|---|
| `POST /api/github/repos/visibility` | `X-CodeShelf-Action: visibility` | `{ repos: [{ fullName, visibility: "public" \| "private" }] }` |
| `POST /api/github/repos/delete` | `X-CodeShelf-Action: delete` | `{ repos: [{ fullName }] }` |

Both return `{ results: [{ fullName, success, message?, ...}] }`. The delete loop stops early if GitHub rejects the token (401), and the backend refuses to delete the profile repo (name matches the owner's login) regardless of what the request contains.

### AI endpoint

| Endpoint | Body | Notes |
|---|---|---|
| `POST /api/ai/analyse` | `{ repos: SafeGitHubRepo[] }` | Returns `{ results: RepoAiResult[], warnings?: string[] }`. Returns **503** when AI is disabled. When every batch fails it returns the first batch's error: the provider's own status when present (e.g. **503** for a missing key), otherwise **502** for unparseable output. |

**Response shape:** `results` is the array of per-repo AI results. `warnings` is optional; it appears only when one or more batches could not be parsed, and each entry names the batch and how many repos were skipped (e.g. `"Batch 3 of 5 returned unparseable output (12 repos skipped)."`). Repos with no surviving result simply show no AI panel, which is the normal behavior for unanalysed repos.

**Batching:** after the `private === false` filter, repos are split into chunks of 12 and each chunk is sent to the provider sequentially. Provider code is stateless and receives only its chunk; batch size is the only change at the call site.

**AI boundary (enforced in backend code):** before any provider is called, the backend filters the submitted repos to `private === false`. Every provider then strips repos down to a single shared AI-safe field subset (`toAiSafePayload()` in [backend/src/ai/shared.js](../backend/src/ai/shared.js): name, description, language, topics, stars, forks, pushed date, fork/archived flags, license presence, and repo type (validated against the known type set; client-supplied for prompt context only, not a security boundary)). Profile repo results have `suggestDeletion` and `suggestMakePrivate` force-cleared server-side in `normalizeResults()`, regardless of what the model returns. Result rows are accepted only when `repoId` matches a repo in the batch; unmatched rows fall back to case-insensitive `repoName` match and are dropped if that also fails. AI never receives the GitHub token, `.env` values, or private repo data, and has no path to any write endpoint.

---

## Data Model

`SafeGitHubRepo` is the only repo shape the frontend ever sees. It is produced by a whitelist sanitizer ([backend/src/utils/sanitize.js](../backend/src/utils/sanitize.js)); fields not on this list never reach the browser:

```ts
interface SafeGitHubRepo {
  id: number;
  name: string;
  fullName: string;          // owner/name
  description: string | null;
  htmlUrl: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: 'public' | 'private' | 'internal';
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  defaultBranch: string;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  size: number;
  hasIssues: boolean;
  hasProjects: boolean;
  hasWiki: boolean;
  licenseName: string | null;
}
```

---

## Frontend State Model

- All state is Angular **signals**; components use `OnPush` change detection and the modern control-flow syntax (`@if`/`@for`).
- The repo list is the single source of truth. Public/private sections, stats, and filtered views are **derived** via `computed()`, never stored separately.
- Scoring is pure: `scoreRepo(repo, ownerLogin)` in [core/utils/repo-score.utils.ts](../frontend/src/app/core/utils/repo-score.utils.ts) classifies the repo first, then applies a type-specific scorer. See [scoring.md](scoring.md).
- Selection for visibility actions and selection for deletion are **separate sets**. The delete selection only becomes available behind a session-only safety toggle that resets on reload, and protected repos (your profile repo) cannot be marked at all.
- Action flows are state machines: `idle → warning → executing → results` (visibility) and `idle → confirming → executing → results` (deletion). The warning/confirmation screen can never be skipped.

---

## Design Decisions

- **Thin backend on purpose.** No sessions, no accounts, no database, no ORM. It is a secrets boundary, not a product backend. Resist abstracting it.
- **Local-first, read-mostly.** Write actions (visibility, deletion) exist but every one requires manual selection plus an explicit confirmation screen. AI is advisory only.
- **Adapter pattern for AI.** Providers implement one method, `analyzeRepos(repos)`, and are selected by `AI_PROVIDER`. Adding a provider means adding one file; the boundary filter and routes don't change.
- **Styling via design tokens.** All component styles consume CSS custom properties from [frontend/src/styles/tokens.css](../frontend/src/styles/tokens.css). Don't hardcode colors or spacing.
