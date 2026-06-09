import { SafeGitHubRepo } from '../models/github-repo.model';
import { RepoClassification, RepoType } from '../models/repo-type.model';

const DOTFILE_NAMES = new Set(['.dotfiles', 'dotfiles', '.config', 'config', 'setup', 'mackup']);
const CONFIG_TOPICS = new Set(['dotfiles', 'config', 'setup', 'macos', 'linux', 'windows', 'shell', 'zsh', 'bash', 'powershell']);

const LABELS: Record<RepoType, { label: string; description: string }> = {
  profile_repo:      { label: 'Profile repo',       description: 'Your GitHub profile README repo. Protected — do not delete.' },
  portfolio_project: { label: 'Portfolio project',  description: 'Public, active, and well-described. Good to showcase.' },
  active_project:    { label: 'Active project',     description: 'Recently updated and in use.' },
  experiment:        { label: 'Experiment',          description: 'Looks like a personal experiment or learning project.' },
  old_learning_repo: { label: 'Old learning repo',  description: 'Inactive and likely from an earlier learning phase.' },
  fork:              { label: 'Fork',                description: 'A fork of someone else\'s repo.' },
  template:          { label: 'Template',            description: 'A template repo for starting new projects.' },
  config_or_dotfiles:{ label: 'Config / dotfiles',  description: 'Personal config or environment setup files.' },
  archived:          { label: 'Archived',            description: 'Archived on GitHub — read-only and inactive.' },
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

function detectType(repo: SafeGitHubRepo, ownerLogin: string): RepoType {
  // Profile repo: name exactly matches the owner's login
  if (repo.name.toLowerCase() === ownerLogin.toLowerCase()) {
    return 'profile_repo';
  }

  if (repo.archived) return 'archived';

  if (repo.fork) return 'fork';

  // Template repo
  if (repo.name.toLowerCase().includes('template') || repo.topics.includes('template')) {
    return 'template';
  }

  // Config / dotfiles
  if (
    DOTFILE_NAMES.has(repo.name.toLowerCase()) ||
    repo.name.toLowerCase().startsWith('.') ||
    repo.topics.some(t => CONFIG_TOPICS.has(t))
  ) {
    return 'config_or_dotfiles';
  }

  const ageMs = Date.now() - new Date(repo.updatedAt).getTime();
  const MONTHS_12 = 12 * 30 * 24 * 60 * 60 * 1000;
  const MONTHS_24 = 24 * 30 * 24 * 60 * 60 * 1000;
  const hasSignals = !!repo.description && !!repo.language;
  const hasActivity = repo.stargazersCount > 0 || repo.forksCount > 0;

  // Portfolio project: public, described, active, has language
  if (!repo.private && hasSignals && ageMs < MONTHS_12) {
    return 'portfolio_project';
  }

  // Active project: recently touched but may lack description
  if (ageMs < MONTHS_12 && (hasSignals || hasActivity)) {
    return 'active_project';
  }

  // Old learning repo: inactive, no signals, no activity
  if (ageMs > MONTHS_24 && !hasActivity && !hasSignals) {
    return 'old_learning_repo';
  }

  // Experiment: recent-ish but no description or stars
  if (ageMs < MONTHS_24 && !hasSignals && !hasActivity) {
    return 'experiment';
  }

  return 'unknown';
}
