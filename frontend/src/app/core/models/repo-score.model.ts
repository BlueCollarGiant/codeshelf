import { RepoSuggestion } from './repo-suggestion.model';

export interface RepoScore {
  repoId: number;
  portfolioScore: number;
  cleanupScore: number;
  activityScore: number;
  completenessScore: number;
  suggestions: RepoSuggestion[];
}
