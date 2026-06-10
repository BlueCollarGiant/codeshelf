/**
 * Shared helpers for AI providers.
 *
 * toAiSafePayload() is the single definition of which repo fields may ever
 * reach an AI provider. normalizeResults() is the single parser/clamper for
 * provider output. Providers own only their transport and prompt phrasing.
 */

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
    updatedAt: r.updatedAt,
    fork: r.fork,
    archived: r.archived,
    hasLicense: !!r.licenseName,
  }));
}

/** The result fields every provider must return, used in prompt text. */
export const RESULT_SHAPE = `- repoId: number (the id field)
- repoName: string
- skillRating: number 0-100 (coding skill demonstrated)
- professionalismRating: number 0-100 (docs, description, topics, license quality)
- suggestDeletion: boolean
- suggestMakePrivate: boolean
- summary: string (2-3 sentences, honest and constructive)
- flags: string[] (e.g. ["no-description", "is-fork", "stale", "good-readme"])`;

/**
 * Parse raw provider text into a normalized RepoAiResult[].
 * Invalid JSON falls back to neutral per-repo results rather than failing.
 */
export function normalizeResults(text, repos) {
  try {
    const parsed = JSON.parse(text);
    const results = Array.isArray(parsed.results) ? parsed.results : [];
    return results.map(r => ({
      repoId:                Number(r.repoId),
      repoName:              String(r.repoName ?? ''),
      skillRating:           clamp(Number(r.skillRating ?? 50)),
      professionalismRating: clamp(Number(r.professionalismRating ?? 50)),
      suggestDeletion:       Boolean(r.suggestDeletion),
      suggestMakePrivate:    Boolean(r.suggestMakePrivate),
      summary:               String(r.summary ?? ''),
      flags:                 Array.isArray(r.flags) ? r.flags.map(String) : [],
    }));
  } catch {
    return repos.map(r => neutralResult(r));
  }
}

function neutralResult(repo) {
  return {
    repoId: repo.id,
    repoName: repo.name,
    skillRating: 50,
    professionalismRating: 50,
    suggestDeletion: false,
    suggestMakePrivate: false,
    summary: 'Analysis unavailable.',
    flags: [],
  };
}

function clamp(n) {
  return Math.max(0, Math.min(100, isNaN(n) ? 50 : n));
}
