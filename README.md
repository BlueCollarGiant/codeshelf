# CodeShelf

A localhost GitHub repository review and management tool for developers.

Inspect your GitHub repositories, review local cleanup and portfolio scores, optionally run AI analysis on public repos only, and manage visibility or deletion with explicit confirmation.

**No accounts. No cloud. No SaaS. Your token stays on your machine.**

---

## What It Does

- Lists public and private GitHub repositories in one local dashboard
- Scores repos locally for portfolio quality, cleanup priority, activity, and completeness
- Flags missing descriptions, old inactive repos, forks, archived repos, and portfolio candidates
- Optionally runs AI analysis on public repos only
- Lets you manually choose repos for visibility changes or deletion
- Shows a mandatory warning and confirmation screen before any write action executes
- Stores dismissed suggestions in browser localStorage only

---

## Screenshots

Screenshots and a short demo GIF are planned but not captured yet.

Placeholder capture list:

- Dashboard with public and private repo sections
- Setup/status screen with token and AI configuration states
- AI advisory results on public repo cards
- Visibility warning and confirmation screen
- Deletion confirmation and result report
- 20-45 second demo GIF covering dashboard, analysis, and confirmation flow

See [guides/screenshots.md](guides/screenshots.md) for the public media checklist.

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
# Edit .env and add your GITHUB_TOKEN at minimum

# 4. Start both servers
npm run dev
```

Open [http://localhost:4200](http://localhost:4200).

The setup screen shows your connection status and walks through missing configuration.

---

## GitHub Token Setup

CodeShelf requires a GitHub Personal Access Token in your local `.env` file.
The token is used only by the local Express server. It never reaches Angular, browser storage, AI providers, or API responses.

**Fine-grained PAT (recommended)**

GitHub -> Settings -> Developer Settings -> Personal access tokens -> Fine-grained tokens

| What you need | Permission |
|---|---|
| Read repos and metadata | Repository -> Metadata -> Read-only |
| Change repo visibility | Repository -> Administration -> Read/write |
| Delete repos | Repository -> Administration -> Read/write |

**Classic PAT (fallback)**

Use `repo` for repo reads and visibility changes. Add `delete_repo` only if you intend to use deletion.

Classic `repo` grants more access than CodeShelf needs, so the fine-grained token is the safer default.

Do not request `workflow`, `admin:org`, package, gist, notification, or user scopes for CodeShelf.

---

## AI Analysis

AI is optional. Set `AI_PROVIDER` in `.env`:

| Provider | Key needed |
|---|---|
| `none` | Disables AI entirely |
| `mock` | No key; returns seeded local test results |
| `openai` | `OPENAI_API_KEY` |
| `anthropic` | `ANTHROPIC_API_KEY` |
| `ollama` | No cloud key; uses local Ollama |

AI analysis only receives public repository metadata. Private repos are filtered in backend code before any AI provider is called.

AI results are advisory only. They never select repos, trigger writes, or call GitHub.

---

## Safety Model

- Express binds to `127.0.0.1` only
- CORS is restricted to `http://localhost:4200`
- The GitHub token lives only in `.env` and `process.env.GITHUB_TOKEN`
- Angular never reads `.env` and never receives the token
- GitHub responses are sanitized before reaching the frontend
- Visibility changes and deletion require manual selection plus confirmation
- CodeShelf is designed for localhost use only; do not deploy it publicly

See [guides/security.md](guides/security.md) for the public security notes.

---

## Demo Walkthrough

No runtime demo mode is built into the app. A future screenshot/GIF walkthrough will show the normal local workflow without adding fake user-facing data paths.

See [guides/demo.md](guides/demo.md) for the planned public walkthrough.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run install:all` | Install root, frontend, and backend dependencies |
| `npm run dev` | Start Angular on port 4200 and Express on port 3000 |
| `npm run dev:frontend` | Start Angular only |
| `npm run dev:backend` | Start Express only |
| `npm run build` | Build frontend and backend |

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | Angular 22 standalone components, signals, OnPush |
| Backend | Node.js + Express, localhost only |
| Auth | GitHub PAT in `.env`, backend-only |
| AI | Adapter pattern selected by `AI_PROVIDER` |
| Storage | localStorage for dismissed suggestions only |
| Database | None |

---

## Roadmap

- Add screenshots and a short demo GIF/video
- Later: export reports, privacy masking, rate limit display
- Not planned: OAuth, SaaS hosting, database, PR automation, GitHub Actions automation

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT. See [LICENSE](LICENSE).
