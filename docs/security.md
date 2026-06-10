# Security

CodeShelf is a localhost-first GitHub repository review tool. It is not designed to be deployed as a hosted service.

## Localhost Boundary

- The Express backend binds to `127.0.0.1`.
- CORS is restricted to localhost origins. The default is `http://localhost:4200`; `ALLOWED_ORIGIN` can change the port, but non-localhost values are rejected at startup and the default is used.
- The frontend calls only the local Express API.
- The frontend never calls GitHub directly.

## Token Handling

The GitHub token must only exist in:

```text
.env
process.env.GITHUB_TOKEN
```

The token must never exist in:

```text
Angular environment files
Browser localStorage
Browser sessionStorage
Frontend state
Console logs
API responses
AI prompts
Committed files
```

## GitHub Scopes

Prefer a fine-grained Personal Access Token.

Token creation pages: [classic tokens](https://github.com/settings/tokens) (the [pre-scoped link](https://github.com/settings/tokens/new?description=CodeShelf&scopes=repo,delete_repo) checks `repo` + `delete_repo` for you) and [fine-grained tokens](https://github.com/settings/personal-access-tokens/new). The README has the full click-by-click path.

| Need | Fine-grained PAT | Classic PAT |
|---|---|---|
| Read repository metadata | Metadata read-only | `repo` fallback |
| Change visibility | Administration read/write | `repo` |
| Delete repositories | Administration read/write | `repo` + `delete_repo` |

Do not request these scopes for CodeShelf:

```text
admin:org
workflow
write:packages
read:packages
gist
user
notifications
```

## AI Boundary

- AI is optional and disabled by default: `AI_PROVIDER` unset or `none` disables it entirely. The mock provider runs only when explicitly set to `mock`.
- AI receives public repository metadata only.
- Private repos are filtered in backend code before any AI provider is called.
- The AI-safe field subset is: name, description, language, topics, stars, forks, pushed date, fork/archived flags, license presence, and repo type (validated server-side against the known type set; advisory prompt context only, not a security boundary).
- Profile repo AI results have `suggestDeletion` and `suggestMakePrivate` force-cleared server-side, regardless of what the provider returns.
- AI never receives the GitHub token or `.env` values.
- AI never calls GitHub.
- AI never selects repos or triggers write actions.

## Write And Delete Actions

Visibility changes and deletion are manual workflows:

- The user selects repos.
- The UI shows a warning/confirmation screen.
- The backend receives only confirmed actions.
- Backend routes require the expected `X-CodeShelf-Action` header.
- Deletion is gated by a session-only UI safety toggle and confirmation screen.
- The profile repo (name matches your login) is refused by the backend delete route, in addition to its disabled checkbox in the UI.

## Public Deployment Warning

Do not deploy this app publicly. The current architecture assumes a single local developer using a local `.env` file. A hosted version would require a different authentication model, user isolation, token storage strategy, and security review.
