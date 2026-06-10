# Contributing to CodeShelf

Thank you for your interest in contributing.

---

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/codeshelf.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Set up your environment: `cp .env.example .env`
5. Install dependencies: `npm run install:all`
6. Start the dev servers: `npm run dev`

---

## Development Guidelines

- **Backend:** Node.js / Express. Bound to `127.0.0.1` only. All secrets in `.env`.
- **Frontend:** Angular 22 standalone components. No NgModules. Signals preferred over RxJS where applicable.
- **No database. No browser storage.**
- **AI boundary:** AI calls happen in the backend only. Public repos only (`private === false`), enforced in backend code.

---

## Pull Requests

- Keep PRs focused: one concern per PR
- Describe what changed and why
- Make sure both servers start without errors before submitting
- Do not commit `.env`

---

## Reporting Issues

Open an issue on GitHub with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Your OS and Node.js version

---

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
