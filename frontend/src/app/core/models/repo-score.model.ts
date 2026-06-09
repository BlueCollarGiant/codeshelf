import { RepoSuggestion } from './repo-suggestion.model';
import { RepoClassification } from './repo-type.model';

export interface RepoScore {
  repoId: number;
  classification: RepoClassification;
  portfolioScore: number;
  cleanupScore: number;
  activityScore: number;
  completenessScore: number;
  suggestions: RepoSuggestion[];
}
