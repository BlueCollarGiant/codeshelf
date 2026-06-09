export type RepoType =
  | 'profile_repo'
  | 'portfolio_project'
  | 'active_project'
  | 'experiment'
  | 'old_learning_repo'
  | 'fork'
  | 'template'
  | 'config_or_dotfiles'
  | 'archived'
  | 'unknown';

export interface RepoClassification {
  type: RepoType;
  protected: boolean;
  label: string;
  description: string;
}
