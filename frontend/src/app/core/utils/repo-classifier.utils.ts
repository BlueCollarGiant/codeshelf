import { SafeGitHubRepo } from '../models/github-repo.model';
import { RepoClassification, RepoType } from '../models/repo-type.model';
import { MONTHS_12, MONTHS_24 } from './time.constants';

const DOTFILE_NAMES = new Set(['.dotfiles', 'dotfiles', '.config', 'config', 'setup', 'mackup']);
const CONFIG_TOPICS = new Set(['dotfiles', 'config', 'setup', 'macos', 'linux', 'windows', 'shell', 'zsh', 'bash', 'powershell']);

const LABELS: Record<RepoType, { label: string; description: string }> = {
  profile_repo:      { label: 'Profile repo',       description: 'Your GitHub profile README repo. Protected. Do not delete.' },
  portfolio_project: { label: 'Portfolio project',  description: 'Public, active, and well-described. Good to showcase.' },
  active_project:    { label: 'Active project',     description: 'Recently updated and in use.' },
  experiment:        { label: 'Experiment',          description: 'Looks like a personal experiment or learning project.' },
  old_learning_repo: { label: 'Old learning repo',  description: 'Inactive and likely from an earlier learning phase.' },
  fork:              { label: 'Fork',                description: 'A fork of someone else\'s repo.' },
  template:          { label: 'Template',            description: 'A template repo for starting new projects.' },
  config_or_dotfiles:{ label: 'Config / dotfiles',  description: 'Personal config or environment setup files.' },
  archived:          { label: 'Archived',            description: 'Archived on GitHub. Read-only and inactive.' },
  empty_repo:        { label: 'Empty repo',          description: 'Nothing has ever been pushed to this repo.' },
  unknown:           { label: 'Repo',                description: 'General repository.' },
};

export function classifyRepo(repo: SafeGitHubRepo, ownerLogin: string): RepoClassification {
  const type = detectType(repo, ownerLogin);
  return {
    type,
    protected: type === 'profile_repo',
    ...LABELS[type],
  };
}

function recencyMs(repo: SafeGitHubRepo): number {
  return Date.now() - new Date(repo.pushedAt ?? repo.updatedAt).getTime();
}

function detectType(repo: SafeGitHubRepo, ownerLogin: string): RepoType {
  if (repo.name.toLowerCase() === ownerLogin.toLowerCase()) {
    return 'profile_repo';
  }

  if (repo.archived) return 'archived';

  // fork must come before empty_repo: forks share parent object storage and can show size=0
  if (repo.fork) return 'fork';

  // empty_repo: nothing ever pushed (size=0 alone is insufficient; language guard protects single-file repos)
  if (repo.size === 0 && repo.language === null) return 'empty_repo';

  if (repo.name.toLowerCase().includes('template') || repo.topics.includes('template')) {
    return 'template';
  }

  if (
    DOTFILE_NAMES.has(repo.name.toLowerCase()) ||
    repo.name.toLowerCase().startsWith('.') ||
    repo.topics.some(t => CONFIG_TOPICS.has(t))
  ) {
    return 'config_or_dotfiles';
  }

  const age = recencyMs(repo);
  const hasSignals = !!repo.description && !!repo.language;
  const hasActivity = repo.stargazersCount > 0 || repo.forksCount > 0;

  if (!repo.private && hasSignals && age < MONTHS_12) {
    return 'portfolio_project';
  }

  if (age < MONTHS_12 && (hasSignals || hasActivity)) {
    return 'active_project';
  }

  if (age > MONTHS_24 && !hasActivity && !hasSignals) {
    return 'old_learning_repo';
  }

  if (age < MONTHS_24 && !hasSignals && !hasActivity) {
    return 'experiment';
  }

  return 'unknown';
}
