export type RepoSuggestionType =
  | 'portfolio_candidate'
  | 'needs_readme'
  | 'needs_description'
  | 'review_visibility'
  | 'old_experiment'
  | 'fork_review'
  | 'already_archived'
  | 'keep_private'
  | 'cleanup_needed'
  | 'healthy_repo'
  | 'profile_repo'
  | 'improve_readme'
  | 'protected'
  | 'config_repo'
  | 'template_repo';

export type RepoSuggestionSeverity = 'info' | 'success' | 'warning' | 'danger';

export interface RepoSuggestion {
  type: RepoSuggestionType;
  label: string;
  severity: RepoSuggestionSeverity;
  reason: string;
}
