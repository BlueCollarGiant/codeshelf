import { SafeGitHubRepo } from '../models/github-repo.model';
import { RepoScore } from '../models/repo-score.model';
import { RepoSuggestion } from '../models/repo-suggestion.model';

const MONTHS_12 = 12 * 30 * 24 * 60 * 60 * 1000;
const MONTHS_6 = 6 * 30 * 24 * 60 * 60 * 1000;
const MONTHS_24 = 24 * 30 * 24 * 60 * 60 * 1000;

function ageMs(dateStr: string): number {
  return Date.now() - new Date(dateStr).getTime();
}

function completenessScore(repo: SafeGitHubRepo): number {
  let score = 0;
  if (repo.description) score += 25;
  if (repo.language) score += 25;
  if (repo.topics.length > 0) score += 25;
  if (repo.licenseName) score += 25;
  return score;
}

function activityScore(repo: SafeGitHubRepo): number {
  const age = ageMs(repo.updatedAt);
  if (age < MONTHS_6) return 50;
  if (age < MONTHS_12) return 30;
  if (age < MONTHS_24) return 10;
  return 0;
}

function portfolioScore(repo: SafeGitHubRepo): number {
  let score = 0;
  if (!repo.private) score += 20;
  if (!repo.fork) score += 20;
  if (!repo.archived) score += 20;
  if (repo.description) score += 20;
  else score -= 20;
  if (repo.language) score += 10;
  else score -= 10;
  if (ageMs(repo.updatedAt) < MONTHS_12) score += 10;
  if (repo.archived) score -= 20;
  if (repo.fork) score -= 20;
  return Math.max(0, Math.min(100, score));
}

function cleanupScore(repo: SafeGitHubRepo): number {
  let score = 0;
  if (!repo.description) score += 25;
  if (ageMs(repo.updatedAt) > MONTHS_12 && repo.stargazersCount === 0 && repo.forksCount === 0) score += 25;
  if (repo.fork) score += 20;
  if (repo.archived) score += 20;
  if (!repo.language) score += 10;
  return Math.max(0, Math.min(100, score));
}

function buildSuggestions(repo: SafeGitHubRepo): RepoSuggestion[] {
  const suggestions: RepoSuggestion[] = [];
  const age = ageMs(repo.updatedAt);

  if (repo.archived) {
    suggestions.push({ type: 'already_archived', label: 'Archived', severity: 'info', reason: 'This repo is already archived.' });
    return suggestions;
  }

  if (repo.private) {
    suggestions.push({ type: 'keep_private', label: 'Private', severity: 'info', reason: 'This repo is private.' });
    return suggestions;
  }

  const isPortfolioCandidate =
    !repo.private && !repo.archived && !repo.fork &&
    !!repo.description && !!repo.language && age < MONTHS_12;

  if (isPortfolioCandidate) {
    suggestions.push({ type: 'portfolio_candidate', label: 'Portfolio', severity: 'success', reason: 'Public, active, described, with a language — good portfolio material.' });
  }

  if (!repo.description) {
    suggestions.push({ type: 'needs_description', label: 'No description', severity: 'warning', reason: 'Missing description hurts discoverability and AI analysis quality.' });
  }

  if (repo.fork) {
    suggestions.push({ type: 'fork_review', label: 'Fork', severity: 'warning', reason: 'Forks on your profile can dilute your portfolio unless you have made meaningful changes.' });
  }

  if (!repo.private && !repo.archived && age > MONTHS_12 && repo.stargazersCount === 0 && repo.forksCount === 0) {
    suggestions.push({ type: 'old_experiment', label: 'Old & quiet', severity: 'danger', reason: 'Public repo with no stars, no forks, and no activity in 12+ months. Consider archiving or making private.' });
  }

  if (suggestions.length === 0) {
    suggestions.push({ type: 'healthy_repo', label: 'Healthy', severity: 'success', reason: 'Repo looks complete and active.' });
  }

  return suggestions;
}

export function scoreRepo(repo: SafeGitHubRepo): RepoScore {
  return {
    repoId: repo.id,
    completenessScore: completenessScore(repo),
    activityScore: activityScore(repo),
    portfolioScore: portfolioScore(repo),
    cleanupScore: cleanupScore(repo),
    suggestions: buildSuggestions(repo),
  };
}
