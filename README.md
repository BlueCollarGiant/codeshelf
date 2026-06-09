# CodeShelf

A localhost GitHub repository review and management tool for developers.

Inspect all your GitHub repositories, get AI-powered ratings on your public repos, and manage visibility and bulk deletion — running entirely on your machine with your own credentials.

**No accounts. No cloud. No SaaS.**

---

## What It Does

- Lists all your GitHub repositories — public and private — in a single dashboard
- Scores every repo locally: portfolio quality, cleanup candidates, missing descriptions
- AI analysis (optional) rates your public repos on skill and professionalism and suggests which to hide or clean up
- You select repos and choose an action: make private, make public, or delete — with a mandatory warning screen before anything executes
- Dismiss or restore suggestions per repo — stored locally in your browser
- Your GitHub token stays in `.env` on your machine and is never sent to the browser

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/BlueCollarGiant/codeshelf.git
cd codeshelf

# 2. Install dependencies
npm run install:all

# 3. Set up your environment
cp .env.example .env
# Edit .env — add your GITHUB_TOKEN at minimum

# 4. Start both servers
npm run dev
```

Open [http://localhost:4200](http://localhost:4200)

The setup screen will show your connection status and walk you through any missing configuration.

---

## GitHub Token Setup

CodeShelf requires a GitHub Personal Access Token in your local `.env` file.
The token is only used by the local Express server — it never reaches the browser or any external service.

**Fine-grained PAT (recommended)**

GitHub → Settings → Developer Settings → Personal access tokens → Fine-grained tokens

| What you need | Permission |
|---|---|
| Read repos and metadata | Repository → Metadata → Read-only |
| Change repo visibility | Repository → Administration → Read/write |
| Delete repos | Repository → Administration → Read/write |

**Classic PAT (fallback)**

Scopes: `repo` for read and visibility changes, add `delete_repo` for deletion.
`repo` grants more access than CodeShelf uses — the fine-grained PAT is more precise.

---

## AI Analysis (Optional)

CodeShelf supports four AI providers. Set `AI_PROVIDER` in your `.env`:

| Provider | Key needed |
|---|---|
| `mock` | None — returns seeded results for testing |
| `openai` | `OPENAI_API_KEY` |
| `anthropic` | `ANTHROPIC_API_KEY` |
| `ollama` | None — uses local Ollama instance |
| `none` | Disables AI entirely |

AI analysis only ever receives your **public** repositories. Private repos are filtered in the backend before any AI call — not just in the UI.

AI results are advisory only. You decide every action.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run install:all` | Install all dependencies (root, frontend, backend) |
| `npm run dev` | Start Angular dev server (port 4200) and Express backend (port 3000) |
| `npm run dev:frontend` | Angular dev server only |
| `npm run dev:backend` | Express backend only |
| `npm run build` | Build Angular for production |

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | Angular 22 — standalone components, signals, OnPush |
| Backend | Node.js + Express — localhost only, not a production server |
| Auth | GitHub PAT in `.env` — never in Angular or browser storage |
| AI | Adapter pattern — swap providers via `AI_PROVIDER` env var |
| Storage | localStorage for dismiss/ignore state only — no database |

---

## Security

- Express binds to `127.0.0.1` only — not reachable from other machines on your network
- CORS is locked to `http://localhost:4200`
- Your GitHub token lives in `.env` and `process.env` only — never in Angular, never in API responses, never logged
- AI providers never receive private repos — filtered in backend code, not just the UI
- GitHub API responses are sanitized before reaching the frontend — raw objects are never forwarded
- Do not deploy CodeShelf publicly — it is designed for localhost use only

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT — see [LICENSE](LICENSE).
