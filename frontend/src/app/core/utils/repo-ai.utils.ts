import { RepoAiResult } from '../models/repo-ai-result.model';
import { RepoScore } from '../models/repo-score.model';

export function buildAiResultMap(
  results: RepoAiResult[],
  scoreMap: Record<number, RepoScore>,
): Record<number, RepoAiResult> {
  const map: Record<number, RepoAiResult> = {};
  for (const r of results) {
    const classification = scoreMap[r.repoId]?.classification;
    map[r.repoId] = classification?.protected
      ? { ...r, suggestDeletion: false }
      : r;
  }
  return map;
}
