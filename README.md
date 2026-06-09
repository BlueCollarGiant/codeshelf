# CodeShelf

A localhost GitHub repository review and management tool.

Inspect all your GitHub repositories, get AI-powered ratings on your public repos, and manage visibility and cleanup — all running locally with your own credentials.

---

## What It Does

- Lists all your GitHub repositories — public and private
- AI rates your public repos on skill, professionalism, and suggests cleanup actions
- You choose which repos to make private, public, or delete — with a confirmation screen before anything changes
- Dismiss or ignore suggestions per repo — stored locally in your browser
- Nothing runs in the cloud. No accounts. No SaaS.

---

## Requirements

- Node.js 20+
- A GitHub Personal Access Token (PAT)
- An OpenAI or Anthropic API key (for AI analysis — optional, Phase 6+)

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/BluecollarGiant/codeshelf.git
cd codeshelf

# 2. Install dependencies
npm run install:all

# 3. Set up your environment
cp .env.example .env
# Edit .env and add your GITHUB_TOKEN

# 4. Start both servers
npm run dev
```

Then open [http://localhost:4200](http://localhost:4200)

---

## GitHub Token Setup

CodeShelf requires a GitHub Personal Access Token stored in your local `.env` file. The token never leaves your machine — it is only used by the local Express backend to call the GitHub API.

**Fine-grained PAT (recommended)**

Go to GitHub → Settings → Developer Settings → Personal access tokens → Fine-grained tokens

| Phase | Permission needed |
|---|---|
| Read repos (Phase 3–6) | Repository → Metadata → Read-only |
| Visibility changes (Phase 7) | Repository → Administration → Read/write |
| Deletion (Phase 7b) | Repository → Administration → Read/write |

**Classic PAT (fallback)**

Scopes: `repo` for read/visibility, add `delete_repo` for deletion.
Note: `repo` grants more access than CodeShelf uses — the fine-grained PAT is more precise.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run install:all` | Install root, frontend, and backend dependencies |
| `npm run dev` | Start both Angular dev server and Express backend |
| `npm run dev:frontend` | Start Angular dev server only (port 4200) |
| `npm run dev:backend` | Start Express backend only (port 3000) |
| `npm run build` | Build Angular for production |

---

## Stack

- **Frontend:** Angular 22, Angular Material, standalone components
- **Backend:** Node.js, Express (localhost only — not a production server)
- **Auth:** GitHub PAT in `.env` — never exposed to the browser
- **AI:** OpenAI or Anthropic via adapter pattern (Phase 6+)
- **Storage:** localStorage for dismiss/ignore state only

---

## Security

- Express is bound to `127.0.0.1` — not accessible from other machines
- CORS is restricted to `http://localhost:4200`
- Your GitHub token lives only in `.env` and `process.env` — never in Angular, localStorage, or API responses
- AI only ever receives your public repos — private repos are filtered in backend code, not just UI
- Raw GitHub API objects are never forwarded — all responses are sanitized before reaching the frontend

---

## Project Status

This project is under active development. See [build-phases.md](docs/build-phases.md) for the current phase.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT — see [LICENSE](LICENSE).
