import { SafeGitHubRepo } from '../models/github-repo.model';
import { RepoScore } from '../models/repo-score.model';
import { RepoSuggestion } from '../models/repo-suggestion.model';
import { RepoClassification } from '../models/repo-type.model';
import { DashboardStats } from '../models/dashboard-stats.model';
import { classifyRepo } from './repo-classifier.utils';
import { DAY_MS, MONTHS_12, MONTHS_24 } from './time.constants';

export const PORTFOLIO_THRESHOLD = 60;
export const CLEANUP_THRESHOLD   = 40;

export const SCORE_WEIGHTS = {
  activity: {
    halfLifeDays: 180,
  },
  cleanup: {
    emptyRepo:          45,
    dead:               30,
    stale:              15,
    forkUnmodified:     20,
    forkModified:       10,
    missingDescription: 10,
    noLanguage:          5,
    gracePeriodDays:    90,
  },
  completeness: {
    description:  25,
    language:     25,
    topicsTier1:  15,
    topicsTier2:  25,
    license:      25,
  },
} as const;

interface ScoreDimensions {
  portfolio: number;
  cleanup: number;
  completeness: number;
  activity: number;
}

function recencyMs(repo: SafeGitHubRepo): number {
  return Date.now() - new Date(repo.pushedAt ?? repo.updatedAt).getTime();
}

function computeActivity(repo: SafeGitHubRepo): number {
  if (repo.archived) return 0;
  const daysSince = recencyMs(repo) / DAY_MS;
  return Math.round(100 * Math.pow(0.5, daysSince / SCORE_WEIGHTS.activity.halfLifeDays));
}

function computeCompleteness(repo: SafeGitHubRepo): number {
  let c = 0;
  if (repo.description) c += SCORE_WEIGHTS.completeness.description;
  if (repo.language)    c += SCORE_WEIGHTS.completeness.language;
  if (repo.topics.length >= 3)      c += SCORE_WEIGHTS.completeness.topicsTier2;
  else if (repo.topics.length >= 1) c += SCORE_WEIGHTS.completeness.topicsTier1;
  if (repo.licenseName) c += SCORE_WEIGHTS.completeness.license;
  return c;
}

// Fork is unmodified if nothing was pushed after the creation month (within 30 days of fork creation)
function isForkUnmodified(repo: SafeGitHubRepo): boolean {
  if (!repo.pushedAt) return true;
  const created = new Date(repo.createdAt).getTime();
  const pushed  = new Date(repo.pushedAt).getTime();
  return pushed - created < 30 * DAY_MS;
}

// ─── Score functions per type ────────────────────────────────────────────────

function scoreProfileRepo(repo: SafeGitHubRepo): ScoreDimensions {
  let portfolio = 40;
  if (repo.description)       portfolio += 10;
  if (repo.topics.length > 0) portfolio += 15;
  if (recencyMs(repo) < MONTHS_12) portfolio += 20;
  if (repo.licenseName)       portfolio += 5;

  return {
    portfolio: Math.min(100, portfolio),
    cleanup: 0,
    completeness: computeCompleteness(repo),
    activity: computeActivity(repo),
  };
}

function scoreConfigRepo(repo: SafeGitHubRepo): ScoreDimensions {
  return {
    portfolio: repo.description ? 40 : 20,
    cleanup: 0,
    completeness: computeCompleteness(repo),
    activity: computeActivity(repo),
  };
}

function scoreTemplateRepo(repo: SafeGitHubRepo): ScoreDimensions {
  let portfolio = 30;
  if (repo.description)         portfolio += 20;
  if (repo.language)            portfolio += 15;
  if (repo.stargazersCount > 0) portfolio += 20;
  return {
    portfolio: Math.min(100, portfolio),
    cleanup: 0,
    completeness: computeCompleteness(repo),
    activity: computeActivity(repo),
  };
}

function scoreEmptyRepo(repo: SafeGitHubRepo): ScoreDimensions {
  return {
    portfolio: 0,
    cleanup: SCORE_WEIGHTS.cleanup.emptyRepo,
    completeness: 10,
    activity: computeActivity(repo),
  };
}

function scoreStandardRepo(repo: SafeGitHubRepo): ScoreDimensions {
  const age    = recencyMs(repo);
  const repoAge = Date.now() - new Date(repo.createdAt).getTime();
  const isNew  = repoAge < SCORE_WEIGHTS.cleanup.gracePeriodDays * DAY_MS;
  const noEngagement = repo.stargazersCount === 0 && repo.forksCount === 0;

  // Portfolio (Phase 5 will introduce a continuous composite; this formula is unchanged for now)
  let portfolio = 0;
  if (!repo.private)    portfolio += 20;
  if (!repo.fork)       portfolio += 20;
  if (!repo.archived)   portfolio += 20;
  if (repo.description) portfolio += 20; else portfolio -= 20;
  if (repo.language)    portfolio += 10; else portfolio -= 10;
  if (age < MONTHS_12)  portfolio += 10;
  if (repo.archived)    portfolio -= 20;
  if (repo.fork)        portfolio -= 20;

  // Cleanup: reweighted per §3.4
  let cleanup = 0;
  if (!isNew) {
    if (age > MONTHS_24 && noEngagement)                          cleanup += SCORE_WEIGHTS.cleanup.dead;
    else if (age > MONTHS_12 && age <= MONTHS_24 && noEngagement) cleanup += SCORE_WEIGHTS.cleanup.stale;
  }
  if (repo.fork) {
    cleanup += isForkUnmodified(repo)
      ? SCORE_WEIGHTS.cleanup.forkUnmodified
      : SCORE_WEIGHTS.cleanup.forkModified;
  }
  if (!repo.description) cleanup += SCORE_WEIGHTS.cleanup.missingDescription;
  if (!repo.language)    cleanup += SCORE_WEIGHTS.cleanup.noLanguage;

  return {
    portfolio:    Math.max(0, Math.min(100, portfolio)),
    cleanup:      Math.max(0, Math.min(100, cleanup)),
    completeness: computeCompleteness(repo),
    activity:     computeActivity(repo),
  };
}

// ─── Suggestion builder ───────────────────────────────────────────────────────

function buildSuggestions(repo: SafeGitHubRepo, classification: RepoClassification): RepoSuggestion[] {
  const { type } = classification;

  if (type === 'profile_repo') {
    const suggestions: RepoSuggestion[] = [
      { type: 'profile_repo', label: 'Profile repo', severity: 'info', reason: 'This is your GitHub profile README repo. It should not be deleted.' },
    ];
    if (!repo.description) {
      suggestions.push({ type: 'improve_readme', label: 'Improve profile', severity: 'warning', reason: 'Adding a description and topics helps visitors understand who you are.' });
    }
    if (recencyMs(repo) > MONTHS_12) {
      suggestions.push({ type: 'improve_readme', label: 'Update profile', severity: 'warning', reason: 'Your profile README hasn\'t been updated in over a year.' });
    }
    return suggestions;
  }

  if (type === 'empty_repo') {
    return [{ type: 'empty_repo', label: 'Empty repo', severity: 'danger', reason: 'Nothing has ever been pushed. Consider deleting it.' }];
  }

  if (type === 'config_or_dotfiles') {
    const suggestions: RepoSuggestion[] = [
      { type: 'config_repo', label: 'Config repo', severity: 'info', reason: 'Personal config or dotfiles repo. Protected from cleanup suggestions.' },
    ];
    if (!repo.description) {
      suggestions.push({ type: 'needs_description', label: 'No description', severity: 'warning', reason: 'A short description helps others understand what your config covers.' });
    }
    return suggestions;
  }

  if (type === 'template') {
    const suggestions: RepoSuggestion[] = [
      { type: 'template_repo', label: 'Template', severity: 'info', reason: 'This is a template repo, scored for reusability, not cleanup.' },
    ];
    if (!repo.description) {
      suggestions.push({ type: 'needs_description', label: 'No description', severity: 'warning', reason: 'Templates without descriptions are hard for others to evaluate.' });
    }
    return suggestions;
  }

  if (repo.archived) {
    return [{ type: 'already_archived', label: 'Archived', severity: 'info', reason: 'This repo is archived. Read-only and already marked inactive.' }];
  }

  if (repo.private) {
    return [{ type: 'keep_private', label: 'Private', severity: 'info', reason: 'This repo is private.' }];
  }

  const suggestions: RepoSuggestion[] = [];
  const age = recencyMs(repo);

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

  let scores: ScoreDimensions;

  if (type === 'profile_repo') {
    scores = scoreProfileRepo(repo);
  } else if (type === 'config_or_dotfiles') {
    scores = scoreConfigRepo(repo);
  } else if (type === 'template') {
    scores = scoreTemplateRepo(repo);
  } else if (type === 'empty_repo') {
    scores = scoreEmptyRepo(repo);
  } else {
    scores = scoreStandardRepo(repo);
  }

  return {
    repoId:            repo.id,
    classification,
    portfolioScore:    scores.portfolio,
    cleanupScore:      scores.cleanup,
    activityScore:     scores.activity,
    completenessScore: scores.completeness,
    suggestions:       buildSuggestions(repo, classification),
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
