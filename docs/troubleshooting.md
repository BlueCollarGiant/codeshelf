# Troubleshooting

Common issues when running CodeShelf locally, roughly in the order you'd hit them.

---

## App won't start

**`npm run dev` fails immediately or commands are not found**
- Run `npm run install:all` first; it installs root, frontend, and backend dependencies.
- CodeShelf requires **Node.js 22.22+ or 24.15+** (Angular 22's supported range; enforced via `engines` in package.json). Check with `node --version`, or run `nvm use` (an `.nvmrc` is included).

**Port already in use**
- Backend (3000): set `PORT` in `.env`, then update `API_BASE` in `frontend/src/app/core/api.constants.ts` to match. It is the single place the frontend stores the backend address.
- Frontend (4200): the port is set in `frontend/angular.json`. If you change it, update `ALLOWED_ORIGIN` in `.env` to match, or CORS will block the app.

---

## "Cannot reach the backend"

The dashboard shows this when requests to `http://localhost:3000` fail.

- Make sure `npm run dev` is running and the `[backend]` line appeared in the terminal.
- The backend binds to `127.0.0.1` only, and that is intentional. Access the app from the same machine it runs on.
- If you started only the frontend (`npm run dev:frontend`), start the backend too.

---

## Token problems

**"GitHub token missing or invalid"**
- `.env` must be in the **repo root** (next to `package.json`), not in `backend/`.
- The variable is `GITHUB_TOKEN=` with no quotes and no spaces.
- The backend reads `.env` once at startup. **Restart `npm run dev` after every `.env` change.**
- Fine-grained tokens expire; check the token still exists at GitHub → Settings → Developer settings.

**Repos load, but visibility changes or deletion fail with a permissions error**
- Reading metadata needs less scope than writing. Visibility changes need *Administration read/write* (fine-grained) or `repo` (classic). Deletion additionally needs `delete_repo` on classic tokens; it is **not** included in `repo`.
- See the scope table in [security.md](security.md).

**"GitHub rate limit exceeded"**
- Authenticated requests get 5,000/hour. The error message includes the reset time; wait and refresh. The setup page shows your remaining quota.

---

## AI analysis

**The Analyse button is greyed out**
- AI is disabled. Set `AI_PROVIDER` in `.env` (`openai`, `anthropic`, `ollama`, or `mock`) and restart. Unset, `none`, or a typo in the value all mean disabled. This is by design.
- Use `AI_PROVIDER=mock` to try the flow with no API key.

**"AI analysis failed"**
- `openai` / `anthropic`: the matching API key is missing, invalid, or out of quota.
- `ollama`: make sure Ollama is running locally and `OLLAMA_URL` / `OLLAMA_MODEL` in `.env` are correct (`ollama list` shows installed models).
- Only **public** repos are analysed. If everything you selected is private, you'll get empty results. That is the AI boundary working as intended.

**A repo shows no AI badge after analysis**
- Private repos never get AI results. The profile repo never shows an AI delete suggestion; it is protected.

---

## Deletion

**Delete checkboxes don't appear**
- Switch on the **Enable deletion** toggle in the controls bar. It is session-only and resets on reload. That is deliberate.

**One repo's delete checkbox is disabled and says "Protected"**
- That is your profile repo (name matches your username). CodeShelf will not let you mark it for deletion.

**Deletions fail with a scope error**
- Classic tokens need `delete_repo` added explicitly. Fine-grained tokens need *Administration read/write* on the affected repos.

---

## Still stuck?

Open an issue with what you expected, what happened, reproduction steps, and your OS + Node version. See [CONTRIBUTING.md](../CONTRIBUTING.md).
