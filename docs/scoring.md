# Scoring and Classification

Every repo gets four scores (portfolio, cleanup, activity, completeness) and a set of suggestion badges. All of it is computed **locally** by pure TypeScript functions — no AI, no network calls. The code lives in:

- [frontend/src/app/core/utils/repo-classifier.utils.ts](../frontend/src/app/core/utils/repo-classifier.utils.ts) — classification
- [frontend/src/app/core/utils/repo-score.utils.ts](../frontend/src/app/core/utils/repo-score.utils.ts) — scoring + suggestions

The in-app **How It Works** page covers the same material for end users; this doc is the precise reference.

---

## Step 1 — Classification (always runs before scoring)

`classifyRepo(repo, ownerLogin)` assigns exactly one type. Checks run in this order — first match wins:

| Order | Type | Condition |
|---|---|---|
| 1 | `profile_repo` | Repo name equals the owner's login (case-insensitive). **Protected.** |
| 2 | `archived` | `archived === true` |
| 3 | `fork` | `fork === true` |
| 4 | `template` | Name contains `template`, or topics include `template` |
| 5 | `config_or_dotfiles` | Name is one of `.dotfiles`, `dotfiles`, `.config`, `config`, `setup`, `mackup`; or name starts with `.`; or topics include any of `dotfiles`, `config`, `setup`, `macos`, `linux`, `windows`, `shell`, `zsh`, `bash`, `powershell` |
| 6 | `portfolio_project` | Public + has description + has language + updated within 12 months |
| 7 | `active_project` | Updated within 12 months + (has description & language, or has stars/forks) |
| 8 | `old_learning_repo` | Updated more than 24 months ago + no description/language + no stars/forks |
| 9 | `experiment` | Updated within 24 months + no description/language + no stars/forks |
| 10 | `unknown` | Anything else (e.g. an old repo that is well-described but has no activity) |

`protected` is `true` only for `profile_repo`.

### What protected means

- Cleanup score is pinned to **0**.
- No delete-leaning suggestion can ever fire locally.
- AI delete suggestions are stripped from results before display.
- The delete checkbox on the repo card is **disabled** — a protected repo cannot be marked for deletion even with the deletion toggle on.
- The backend delete route independently refuses the profile repo, so even a request that bypasses the UI cannot delete it.

---

## Step 2 — Scoring (type-specific)

Each type routes to its own scorer. All scores are 0–100.

### Profile repo

| Score | Formula |
|---|---|
| Portfolio | Base 40, +10 description, +15 has topics, +20 updated < 12 mo, +5 license (capped at 100) |
| Cleanup | Always **0** |
| Completeness | 60 with description, 30 without |
| Activity | 50 if updated < 12 mo, else 10 |

### Config / dotfiles

| Score | Formula |
|---|---|
| Portfolio | 40 with description, 20 without |
| Cleanup | Always **0** — config repos are intentional, never cleanup candidates |
| Completeness | 50 with description, 25 without |
| Activity | 40 if updated < 12 mo, else 10 |

### Template

| Score | Formula |
|---|---|
| Portfolio | Base 30, +20 description, +15 language, +20 any stars (capped at 100) |
| Cleanup | Always **0** |
| Completeness | 60 with description, 30 without |
| Activity | 40 if updated < 12 mo, else 10 |

### Everything else (standard scorer — includes forks and archived repos)

**Portfolio** (clamped 0–100):

```
+20 public          +20 not a fork       +20 not archived
+20 description     (−20 if missing)
+10 language        (−10 if missing)
+10 updated within 12 months
−20 archived        −20 fork
```

**Cleanup** (clamped 0–100):

```
+25 missing description
+25 old & quiet (no update in 12+ months, 0 stars, 0 forks)
+20 fork
+20 archived
+10 no language
```

**Completeness:** +25 each for description, language, topics, license.

**Activity:** 50 if updated < 6 mo · 30 if < 12 mo · 10 if < 24 mo · 0 otherwise.

### Dashboard thresholds

- **Portfolio candidate** stat counts repos with portfolio score ≥ **60**.
- **Cleanup** stat counts repos with cleanup score ≥ **40**.

---

## Step 3 — Suggestions (type-aware)

| Repo type | Possible badges |
|---|---|
| Profile repo | `Profile repo` (info) · `Improve profile` if no description · `Update profile` if stale > 12 mo |
| Config / dotfiles | `Config repo` (info) · `No description` (warning) |
| Template | `Template` (info) · `No description` (warning) |
| Archived | `Archived` (info) only |
| Private (non-special) | `Private` (info) only |
| Standard public | Any of the below |

Standard-path badges:

| Badge | Severity | Fires when |
|---|---|---|
| `Portfolio` | success | Public, not archived, not fork, has description + language, updated < 12 mo |
| `No description` | warning | Description missing |
| `Fork` | warning | Repo is a fork |
| `Old & quiet` | danger | Public, not archived, no update in 12+ months, 0 stars, 0 forks |
| `Healthy` | success | Nothing else fired |

---

## AI ratings (optional, separate layer)

When AI analysis is enabled, public repos also get advisory `skillRating` / `professionalismRating` (0–100), optional *consider deleting* / *consider private* flags, and a short summary. These never feed back into the local scores — they are displayed side by side, and the user makes every decision. See [security.md](security.md) for the AI boundary.

---

## Known approximations

- "Months" are approximated as 30 days.
- Recency uses `updatedAt` (any repo activity), not `pushedAt` (commits only).
- Activity score tops out at 50, and profile-repo completeness at 60 — treat scores as guides for comparison, not absolute grades.
- Template detection relies on the name/topic heuristic; GitHub's `is_template` flag is not currently used.
