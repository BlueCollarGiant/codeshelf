import { SafeGitHubRepo } from '../models/github-repo.model';
import { RepoScore } from '../models/repo-score.model';
import { RepoSuggestion } from '../models/repo-suggestion.model';
import { RepoClassification } from '../models/repo-type.model';
import { DashboardStats } from '../models/dashboard-stats.model';
import { classifyRepo } from './repo-classifier.utils';
import { MONTHS_6, MONTHS_12, MONTHS_24 } from './time.constants';

export const PORTFOLIO_THRESHOLD = 60;
export const CLEANUP_THRESHOLD   = 40;

function ageMs(dateStr: string): number {
  return Date.now() - new Date(dateStr).getTime();
}

// ─── Score functions per type ────────────────────────────────────────────────

function scoreProfileRepo(repo: SafeGitHubRepo): { portfolio: number; cleanup: number; completeness: number; activity: number } {
  let portfolio = 40; // base: profile repos have inherent value
  if (repo.description) portfolio += 10;
  if (repo.topics.length > 0) portfolio += 15;
  if (ageMs(repo.updatedAt) < MONTHS_12) portfolio += 20;
  if (repo.licenseName) portfolio += 5;

  return {
    portfolio: Math.min(100, portfolio),
    cleanup: 0,   // never flag profile repo for cleanup
    completeness: repo.description ? 60 : 30,
    activity: ageMs(repo.updatedAt) < MONTHS_12 ? 50 : 10,
  };
}

function scoreConfigRepo(repo: SafeGitHubRepo): { portfolio: number; cleanup: number; completeness: number; activity: number } {
  return {
    portfolio: repo.description ? 40 : 20,
    cleanup: 0,   // config repos are intentional, never cleanup candidates
    completeness: repo.description ? 50 : 25,
    activity: ageMs(repo.updatedAt) < MONTHS_12 ? 40 : 10,
  };
}

function scoreTemplateRepo(repo: SafeGitHubRepo): { portfolio: number; cleanup: number; completeness: number; activity: number } {
  let portfolio = 30;
  if (repo.description) portfolio += 20;
  if (repo.language) portfolio += 15;
  if (repo.stargazersCount > 0) portfolio += 20;
  return {
    portfolio: Math.min(100, portfolio),
    cleanup: 0,
    completeness: repo.description ? 60 : 30,
    activity: ageMs(repo.updatedAt) < MONTHS_12 ? 40 : 10,
  };
}

function scoreStandardRepo(repo: SafeGitHubRepo): { portfolio: number; cleanup: number; completeness: number; activity: number } {
  // Portfolio
  let portfolio = 0;
  if (!repo.private)  portfolio += 20;
  if (!repo.fork)     portfolio += 20;
  if (!repo.archived) portfolio += 20;
  if (repo.description) portfolio += 20; else portfolio -= 20;
  if (repo.language)    portfolio += 10; else portfolio -= 10;
  if (ageMs(repo.updatedAt) < MONTHS_12) portfolio += 10;
  if (repo.archived) portfolio -= 20;
  if (repo.fork)     portfolio -= 20;

  // Cleanup
  let cleanup = 0;
  if (!repo.description) cleanup += 25;
  if (ageMs(repo.updatedAt) > MONTHS_12 && repo.stargazersCount === 0 && repo.forksCount === 0) cleanup += 25;
  if (repo.fork)     cleanup += 20;
  if (repo.archived) cleanup += 20;
  if (!repo.language) cleanup += 10;

  // Completeness
  let completeness = 0;
  if (repo.description)    completeness += 25;
  if (repo.language)        completeness += 25;
  if (repo.topics.length > 0) completeness += 25;
  if (repo.licenseName)    completeness += 25;

  // Activity
  const age = ageMs(repo.updatedAt);
  const activity = age < MONTHS_6 ? 50 : age < MONTHS_12 ? 30 : age < MONTHS_24 ? 10 : 0;

  return {
    portfolio:   Math.max(0, Math.min(100, portfolio)),
    cleanup:     Math.max(0, Math.min(100, cleanup)),
    completeness,
    activity,
  };
}

// ─── Suggestion builder ───────────────────────────────────────────────────────

function buildSuggestions(repo: SafeGitHubRepo, classification: RepoClassification): RepoSuggestion[] {
  const { type, protected: isProtected } = classification;

  // Profile repo: special rules only
  if (type === 'profile_repo') {
    const suggestions: RepoSuggestion[] = [
      { type: 'profile_repo', label: 'Profile repo', severity: 'info', reason: 'This is your GitHub profile README repo. It should not be deleted.' },
    ];
    if (!repo.description) {
      suggestions.push({ type: 'improve_readme', label: 'Improve profile', severity: 'warning', reason: 'Adding a description and topics helps visitors understand who you are.' });
    }
    if (ageMs(repo.updatedAt) > MONTHS_12) {
      suggestions.push({ type: 'improve_readme', label: 'Update profile', severity: 'warning', reason: 'Your profile README hasn\'t been updated in over a year.' });
    }
    return suggestions;
  }

  // Config / dotfiles: never cleanup
  if (type === 'config_or_dotfiles') {
    const suggestions: RepoSuggestion[] = [
      { type: 'config_repo', label: 'Config repo', severity: 'info', reason: 'Personal config or dotfiles repo. Protected from cleanup suggestions.' },
    ];
    if (!repo.description) {
      suggestions.push({ type: 'needs_description', label: 'No description', severity: 'warning', reason: 'A short description helps others understand what your config covers.' });
    }
    return suggestions;
  }

  // Template repo
  if (type === 'template') {
    const suggestions: RepoSuggestion[] = [
      { type: 'template_repo', label: 'Template', severity: 'info', reason: 'This is a template repo, scored for reusability, not cleanup.' },
    ];
    if (!repo.description) {
      suggestions.push({ type: 'needs_description', label: 'No description', severity: 'warning', reason: 'Templates without descriptions are hard for others to evaluate.' });
    }
    return suggestions;
  }

  // Archived
  if (repo.archived) {
    return [{ type: 'already_archived', label: 'Archived', severity: 'info', reason: 'This repo is archived. Read-only and already marked inactive.' }];
  }

  // Private
  if (repo.private) {
    return [{ type: 'keep_private', label: 'Private', severity: 'info', reason: 'This repo is private.' }];
  }

  // Standard scoring path
  const suggestions: RepoSuggestion[] = [];
  const age = ageMs(repo.updatedAt);

  if (type === 'portfolio_project') {
    suggestions.push({ type: 'portfolio_candidate', label: 'Portfolio', severity: 'success', reason: 'Public, active, described, with a language. Good portfolio material.' });
  }

  if (!repo.description) {
    suggestions.push({ type: 'needs_description', label: 'No description', severity: 'warning', reason: 'Missing description hurts discoverability and AI analysis quality.' });
  }

  if (repo.fork) {
    suggestions.push({ type: 'fork_review', label: 'Fork', severity: 'warning', reason: 'Forks on your profile can dilute your portfolio unless you\'ve made meaningful changes.' });
  }

  if (!repo.private && !repo.archived && age > MONTHS_12 && repo.stargazersCount === 0 && repo.forksCount === 0) {
    suggestions.push({ type: 'old_experiment', label: 'Old & quiet', severity: 'danger', reason: 'Public repo with no stars, no forks, and no activity in 12+ months. Consider archiving or making private.' });
  }

  if (suggestions.length === 0) {
    suggestions.push({ type: 'healthy_repo', label: 'Healthy', severity: 'success', reason: 'Repo looks complete and active.' });
  }

  return suggestions;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function scoreRepo(repo: SafeGitHubRepo, ownerLogin: string = ''): RepoScore {
  const classification = classifyRepo(repo, ownerLogin);
  const { type } = classification;

  let scores: { portfolio: number; cleanup: number; completeness: number; activity: number };

  if (type === 'profile_repo') {
    scores = scoreProfileRepo(repo);
  } else if (type === 'config_or_dotfiles') {
    scores = scoreConfigRepo(repo);
  } else if (type === 'template') {
    scores = scoreTemplateRepo(repo);
  } else {
    scores = scoreStandardRepo(repo);
  }

  return {
    repoId:           repo.id,
    classification,
    portfolioScore:   scores.portfolio,
    cleanupScore:     scores.cleanup,
    activityScore:    scores.activity,
    completenessScore: scores.completeness,
    suggestions:      buildSuggestions(repo, classification),
  };
}

export function computeDashboardStats(repos: SafeGitHubRepo[], scoreMap: Record<number, RepoScore>): DashboardStats {
  return {
    total:               repos.length,
    public:              repos.filter(r => !r.private).length,
    private:             repos.filter(r => r.private).length,
    archived:            repos.filter(r => r.archived).length,
    forks:               repos.filter(r => r.fork).length,
    portfolioCandidates: Object.values(scoreMap).filter(s => s.portfolioScore >= PORTFOLIO_THRESHOLD).length,
    cleanupCandidates:   Object.values(scoreMap).filter(s => s.cleanupScore >= CLEANUP_THRESHOLD).length,
  };
}
