/**
 * Shared helpers for AI providers.
 *
 * toAiSafePayload() is the single definition of which repo fields may ever
 * reach an AI provider. normalizeResults() is the single parser/clamper for
 * provider output. Providers own only their transport and prompt phrasing.
 */

const VALID_REPO_TYPES = new Set([
  'profile_repo', 'portfolio_project', 'active_project', 'experiment',
  'old_learning_repo', 'fork', 'template', 'config_or_dotfiles',
  'archived', 'empty_repo', 'unknown',
]);

/** Strip repos to the AI-safe field subset. Never add token or .env values here. */
export function toAiSafePayload(repos) {
  return repos.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    language: r.language,
    topics: r.topics,
    stars: r.stargazersCount,
    forks: r.forksCount,
    pushedAt: r.pushedAt,
    fork: r.fork,
    archived: r.archived,
    hasLicense: !!r.licenseName,
    repoType: VALID_REPO_TYPES.has(r.repoType) ? r.repoType : 'unknown',
  }));
}

/** Per-type prompt rules injected into every provider prompt. */
export const TYPE_RULES = `Per-type instructions (apply based on the repoType field):
- profile_repo: This is the user's GitHub profile README, a personal landing page. Judge content and presentation quality. It is not a software project; skillRating reflects how well it presents the user. Never suggest deletion or making private.
- portfolio_project: Judge as a showcase project: code substance, docs, recency.
- active_project: Active work in progress; judge trajectory. Do not punish missing polish harshly.
- experiment / old_learning_repo: Learning artifacts are not automatically bad. Judge whether keeping them public helps or dilutes the profile; suggest private over delete.
- fork: Judge whether keeping this fork public serves the user (meaningful changes? upstream contribution?), not whether the upstream project is good.
- template: Judge reusability and clarity of purpose.
- config_or_dotfiles: Personal infrastructure. Never suggest deletion. Private is acceptable to suggest only if the naming looks obviously sensitive.
- empty_repo: Empty repo. State that plainly. A deletion suggestion is appropriate, phrased as a consideration.
- archived: Already archived means the decision was already made. Judge it as a finished artifact: does it present well? Do not treat archival itself as failure.
- unknown: Apply standard project rules.

All deletion or privacy suggestions are advisory. Phrase them as considerations ("worth considering making this private"), never as instructions. The user makes every decision.`;

/** The result fields every provider must return, used in prompt text. */
export const RESULT_SHAPE = `- repoId: number (the id field)
- repoName: string
- skillRating: number 0-100 (coding skill demonstrated)
  Anchors: 90-100 strong signal, well-demonstrated ability; 75-89 good but polishable; 55-74 acceptable but ordinary; 35-54 weak or unclear; 0-34 actively unhelpful to the profile. Use the full range. Do not cluster ratings; differentiate between repos.
- professionalismRating: number 0-100 (docs, description, topics, license quality)
  Anchors: 90-100 thorough and well-presented; 75-89 mostly there; 55-74 adequate; 35-54 sparse or missing key items; 0-34 empty or misleading. Use the full range. Differentiate between repos.
- suggestDeletion: boolean
- suggestMakePrivate: boolean
- summary: string (2-3 sentences, honest and constructive)
- flags: string[] (e.g. ["no-description", "is-fork", "stale", "good-readme"])`;

/**
 * Parse raw provider text into a normalized RepoAiResult[], or return null if
 * the text is unparseable or carries no results array (a response with no JSON
 * object counts as a failure, not an empty success). Callers decide on null.
 * Profile repo results have suggestDeletion and suggestMakePrivate force-cleared.
 * Results are accepted only when repoId matches a repo in the batch; unmatched
 * rows fall back to case-insensitive repoName match, then are dropped.
 */
export function normalizeResults(text, repos) {
  const typeMap = new Map(
    repos.map(r => [r.id, VALID_REPO_TYPES.has(r.repoType) ? r.repoType : 'unknown'])
  );
  const idSet   = new Set(repos.map(r => r.id));
  const nameMap = new Map(repos.map(r => [r.name.toLowerCase(), r.id]));

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed?.results)) return null;
    const rows = parsed.results;
    const normalized = [];
    for (const r of rows) {
      const numId = Number(r.repoId);
      let resolvedId;
      if (idSet.has(numId)) {
        resolvedId = numId;
      } else {
        const nameLower = String(r.repoName ?? '').toLowerCase();
        if (nameLower && nameMap.has(nameLower)) {
          resolvedId = nameMap.get(nameLower);
        } else {
          continue;
        }
      }
      const isProfile = typeMap.get(resolvedId) === 'profile_repo';
      normalized.push({
        repoId:                resolvedId,
        repoName:              String(r.repoName ?? ''),
        skillRating:           clamp(Number(r.skillRating ?? 50)),
        professionalismRating: clamp(Number(r.professionalismRating ?? 50)),
        suggestDeletion:       isProfile ? false : Boolean(r.suggestDeletion),
        suggestMakePrivate:    isProfile ? false : Boolean(r.suggestMakePrivate),
        summary:               String(r.summary ?? ''),
        flags:                 Array.isArray(r.flags) ? r.flags.map(String) : [],
      });
    }
    return normalized;
  } catch {
    return null;
  }
}

function clamp(n) {
  return Math.max(0, Math.min(100, isNaN(n) ? 50 : n));
}
