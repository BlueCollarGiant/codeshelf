# Scoring and Classification

Every repo gets four scores (portfolio, cleanup, activity, completeness) and a set of suggestion badges. All of it is computed **locally** by pure TypeScript functions: no AI, no network calls. The code lives in:

- [frontend/src/app/core/utils/repo-classifier.utils.ts](../frontend/src/app/core/utils/repo-classifier.utils.ts) (classification)
- [frontend/src/app/core/utils/repo-score.utils.ts](../frontend/src/app/core/utils/repo-score.utils.ts) (scoring + suggestions)

All score weights are defined in the exported `SCORE_WEIGHTS` constant in `repo-score.utils.ts`. Tuning any formula is a one-file change.

The in-app **How It Works** page covers the same material for end users; this doc is the precise reference.

---

## Step 1: Classification (always runs before scoring)

`classifyRepo(repo, ownerLogin)` assigns exactly one type. Checks run in this order, and the first match wins:

| Order | Type | Condition |
|---|---|---|
| 1 | `profile_repo` | Repo name equals the owner's login (case-insensitive). **Protected.** |
| 2 | `archived` | `archived === true` |
| 3 | `fork` | `fork === true` (checked before empty_repo: forks share parent object storage and may report size 0) |
| 4 | `empty_repo` | `size === 0 && language === null` (nothing has ever been pushed) |
| 5 | `template` | Name contains `template`, or topics include `template` |
| 6 | `config_or_dotfiles` | Name is one of `.dotfiles`, `dotfiles`, `.config`, `config`, `setup`, `mackup`; or name starts with `.`; or topics include any of `dotfiles`, `config`, `setup`, `macos`, `linux`, `windows`, `shell`, `zsh`, `bash`, `powershell` |
| 7 | `portfolio_project` | Public + has description + has language + pushed within 12 months |
| 8 | `active_project` | Pushed within 12 months + (has description & language, or has stars/forks) |
| 9 | `old_learning_repo` | Pushed more than 24 months ago + no description/language + no stars/forks |
| 10 | `experiment` | Pushed within 24 months + no description/language + no stars/forks |
| 11 | `unknown` | Anything else |

All recency checks use `pushedAt ?? updatedAt` (pushed date preferred; falls back to updated date when pushed is null).

`protected` is `true` only for `profile_repo`.

### What protected means

- Cleanup score is pinned to **0**.
- No delete-leaning suggestion can ever fire locally.
- AI delete suggestions are stripped from results before display.
- The delete checkbox on the repo card is **disabled**: a protected repo cannot be marked for deletion even with the deletion toggle on.
- The backend delete route independently refuses the profile repo, so even a request that bypasses the UI cannot delete it.

---

## Step 2: Scoring (type-specific)

Each type routes to its own scorer. All scores are 0-100. All weights live in `SCORE_WEIGHTS`.

### Activity (all types)

Continuous exponential decay with half-life 180 days:

```
activity = round(100 x 0.5 ^ (daysSincePush / 180))
```

Input is `pushedAt ?? updatedAt`. The card date display uses the same input.

| Days since push | Activity |
|---|---|
| 1 | ~100 |
| 90 | ~71 |
| 180 | 50 |
| 360 | 25 |
| 720 | ~6 |

**Archived repos pin activity to 0** (archived repos cannot receive pushes).

### Completeness (all types except empty_repo)

| Signal | Points |
|---|---|
| Has description | +25 |
| Has language | +25 |
| 1-2 topics | +15 |
| 3+ topics | +25 |
| Has license | +25 |

Maximum: 100 (with 3+ topics). **Empty repos cap completeness at 10** regardless of signals.

### Profile repo

| Score | Formula |
|---|---|
| Portfolio | Base 40, +10 description, +15 has topics, +20 pushed < 12 mo, +5 license (capped at 100) |
| Cleanup | Always **0** |
| Completeness | Standard formula |
| Activity | Exponential decay |

### Config / dotfiles

| Score | Formula |
|---|---|
| Portfolio | 40 with description, 20 without |
| Cleanup | Always **0** |
| Completeness | Standard formula |
| Activity | Exponential decay |

### Template

| Score | Formula |
|---|---|
| Portfolio | Base 30, +20 description, +15 language, +20 any stars (capped at 100) |
| Cleanup | Always **0** |
| Completeness | Standard formula |
| Activity | Exponential decay |

### Empty repo (new)

| Score | Value |
|---|---|
| Portfolio | 0 |
| Cleanup | 45 |
| Completeness | 10 (cap) |
| Activity | Exponential decay |

### Everything else (standard scorer, includes forks and archived repos)

**Portfolio** (clamped 0-100):

```
+20 public          +20 not a fork       +20 not archived
+20 description     (-20 if missing)
+10 language        (-10 if missing)
+10 pushed within 12 months
-20 archived        -20 fork
```

**Cleanup** (clamped 0-100):

| Signal | Weight |
|---|---|
| Empty repo (size 0, no language) | +45 |
| Dead: no push in 24+ months, 0 stars, 0 forks | +30 |
| Stale: no push in 12-24 months, 0 stars, 0 forks | +15 |
| Fork never modified (no push after creation month) | +20 |
| Fork modified (pushed after creation month) | +10 |
| Missing description | +10 |
| No language | +5 |

**Grace period:** repos created within the last 90 days are exempt from the dead and stale penalties. A brand-new repo with no activity yet is not a cleanup candidate.

Protected types (profile, config, template) are pinned to cleanup 0 by their own scorers and never reach this path.

### Dashboard thresholds

- **Portfolio candidate** stat counts repos with portfolio score >= **60**.
- **Cleanup** stat counts repos with cleanup score >= **40**.

---

## Step 3: Suggestions (type-aware)

### Suggestion taxonomy

Every suggestion belongs to exactly one bucket:

| Bucket | Severity | Allowed language |
|---|---|---|
| Polish | `warning` | add, improve, update |
| Visibility/lifecycle | `warning`/`danger` | archive, make private, review |
| Removal candidate | `danger` | consider deleting (empty_repo only) |
| Protected/informational | `info`/`success` | descriptive only |

Removal-bucket language is always advisory ("consider deleting"), never imperative.

| Repo type | Possible badges |
|---|---|
| Profile repo | `Profile repo` (info) · `Improve profile` if no description · `Update profile` if stale > 12 mo |
| Config / dotfiles | `Config repo` (info) · `No description` (warning) |
| Template | `Template` (info) · `No description` (warning) |
| Empty repo | `Empty repo` (danger) |
| Archived | `Archived` (info) only |
| Private (non-special) | `Private` (info) only |
| Standard public | Any of the below |

Standard-path badges:

| Badge | Severity | Fires when |
|---|---|---|
| `Portfolio` | success | Public, not archived, not fork, has description + language, pushed < 12 mo |
| `No description` | warning | Description missing |
| `Fork` | warning | Repo is a fork |
| `Old & quiet` | danger | Public, not archived, no push in 12+ months, 0 stars, 0 forks |
| `Healthy` | success | Nothing else fired |

---

## AI ratings (optional, separate layer)

When AI analysis is enabled, public repos also get advisory `skillRating` / `professionalismRating` (0-100), optional suggestion flags, and a short summary. These never feed back into the local scores; they are displayed side by side, and the user makes every decision. See [security.md](security.md) for the AI boundary.

---

## Known approximations

- "Months" are approximated as 30 days in time constants.
- Recency uses `pushedAt ?? updatedAt`: pushed date preferred (code commits only), with a fallback to updated date when pushed is null.
- The standard portfolio formula still double-counts fork and archive penalties; this is corrected in Phase 5.
- Template detection relies on name/topic heuristics; GitHub's `is_template` flag is not currently used.
