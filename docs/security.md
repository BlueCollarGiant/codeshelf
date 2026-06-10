# Security

CodeShelf is a localhost-first GitHub repository review tool. It is not designed to be deployed as a hosted service.

## Localhost Boundary

- The Express backend binds to `127.0.0.1`.
- CORS is restricted to `http://localhost:4200`.
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

- AI is optional and disabled by default — `AI_PROVIDER` unset or `none` disables it entirely. The mock provider runs only when explicitly set to `mock`.
- AI receives public repository metadata only.
- Private repos are filtered in backend code before any AI provider is called.
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

## Public Deployment Warning

Do not deploy this app publicly. The current architecture assumes a single local developer using a local `.env` file. A hosted version would require a different authentication model, user isolation, token storage strategy, and security review.
