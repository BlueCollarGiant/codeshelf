# CodeShelf Frontend

The Angular 22 app for CodeShelf. Standalone components, signals, OnPush — no NgModules.

Don't run this folder on its own during normal use. From the **repo root**:

```bash
npm run install:all   # install root + frontend + backend dependencies
npm run dev           # start Angular (4200) and the Express backend (3000)
```

The frontend talks only to the local backend (`http://localhost:3000/api`, set in [src/app/core/api.constants.ts](src/app/core/api.constants.ts)). It never calls GitHub directly and never sees your token.

Frontend-only commands (run from this folder):

```bash
npm start        # ng serve on port 4200 (backend must be running separately)
npm run build    # production build to dist/
npm test         # unit tests via Vitest
```

For architecture, scoring rules, and security model, see the [project README](../README.md) and [docs/](../docs/).
