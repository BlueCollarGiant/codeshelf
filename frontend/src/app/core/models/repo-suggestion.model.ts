export type RepoSuggestionType =
  | 'portfolio_candidate'
  | 'needs_description'
  | 'old_experiment'
  | 'fork_review'
  | 'already_archived'
  | 'keep_private'
  | 'healthy_repo'
  | 'profile_repo'
  | 'improve_readme'
  | 'config_repo'
  | 'template_repo'
  | 'empty_repo';

export type RepoSuggestionSeverity = 'info' | 'success' | 'warning' | 'danger';

export interface RepoSuggestion {
  type: RepoSuggestionType;
  label: string;
  severity: RepoSuggestionSeverity;
  reason: string;
}

export type SuggestionFilter = RepoSuggestionType | 'all';
