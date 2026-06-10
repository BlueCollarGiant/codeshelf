import { describe, it, expect } from 'vitest';
import { scoreRepo, SCORE_WEIGHTS, CLEANUP_THRESHOLD } from './repo-score.utils';
import { SafeGitHubRepo } from '../models/github-repo.model';
import { DAY_MS } from './time.constants';

function makeRepo(overrides: Partial<SafeGitHubRepo> = {}): SafeGitHubRepo {
  const now = Date.now();
  return {
    id: 1,
    name: 'test-repo',
    fullName: 'user/test-repo',
    description: 'A test repo',
    htmlUrl: 'https://github.com/user/test-repo',
    private: false,
    fork: false,
    archived: false,
    disabled: false,
    visibility: 'public',
    language: 'TypeScript',
    stargazersCount: 0,
    forksCount: 0,
    openIssuesCount: 0,
    defaultBranch: 'main',
    topics: [],
    createdAt: new Date(now - 365 * DAY_MS).toISOString(),
    updatedAt: new Date(now - 1 * DAY_MS).toISOString(),
    pushedAt: new Date(now - 1 * DAY_MS).toISOString(),
    size: 100,
    hasIssues: true,
    hasProjects: false,
    hasWiki: false,
    licenseName: null,
    ...overrides,
  };
}

// ─── Activity decay boundary values ──────────────────────────────────────────

describe('activity: exponential decay', () => {
  it('repo pushed 1 day ago scores activity >= 99', () => {
    const now = Date.now();
    const repo = makeRepo({ pushedAt: new Date(now - 1 * DAY_MS).toISOString() });
    const { activityScore } = scoreRepo(repo, 'user');
    expect(activityScore).toBeGreaterThanOrEqual(99);
  });

  it('repo pushed 180 days ago scores activity ≈ 50', () => {
    const now = Date.now();
    const repo = makeRepo({ pushedAt: new Date(now - 180 * DAY_MS).toISOString() });
    const { activityScore } = scoreRepo(repo, 'user');
    expect(activityScore).toBe(50);
  });

  it('repo pushed 720 days ago scores activity ≈ 6', () => {
    const now = Date.now();
    const repo = makeRepo({ pushedAt: new Date(now - 720 * DAY_MS).toISOString() });
    const { activityScore } = scoreRepo(repo, 'user');
    expect(activityScore).toBe(6);
  });

  it('archived repo always scores activity 0', () => {
    const now = Date.now();
    const repo = makeRepo({
      archived: true,
      pushedAt: new Date(now - 1 * DAY_MS).toISOString(),
    });
    const { activityScore } = scoreRepo(repo, 'user');
    expect(activityScore).toBe(0);
  });

  it('falls back to updatedAt when pushedAt is null', () => {
    const now = Date.now();
    const repo = makeRepo({
      pushedAt: null,
      updatedAt: new Date(now - 180 * DAY_MS).toISOString(),
    });
    const { activityScore } = scoreRepo(repo, 'user');
    expect(activityScore).toBe(50);
  });
});

// ─── Profile repo ─────────────────────────────────────────────────────────────

describe('scoreRepo: profile_repo', () => {
  it('cleanup is always 0', () => {
    const repo = makeRepo({ name: 'octocat', description: null, language: null });
    const { cleanupScore } = scoreRepo(repo, 'octocat');
    expect(cleanupScore).toBe(0);
  });

  it('has non-zero portfolio score', () => {
    const repo = makeRepo({ name: 'octocat' });
    const { portfolioScore } = scoreRepo(repo, 'octocat');
    expect(portfolioScore).toBeGreaterThan(0);
  });
});

// ─── Empty repo ───────────────────────────────────────────────────────────────

describe('scoreRepo: empty_repo', () => {
  const now = Date.now();
  const emptyRepo = makeRepo({
    size: 0,
    language: null,
    fork: false,
    archived: false,
    createdAt: new Date(now - 365 * DAY_MS).toISOString(),
  });

  it('cleanup >= 45', () => {
    const { cleanupScore } = scoreRepo(emptyRepo, 'user');
    expect(cleanupScore).toBeGreaterThanOrEqual(SCORE_WEIGHTS.cleanup.emptyRepo);
  });

  it('cleanup >= CLEANUP_THRESHOLD (appears in cleanup stat)', () => {
    const { cleanupScore } = scoreRepo(emptyRepo, 'user');
    expect(cleanupScore).toBeGreaterThanOrEqual(CLEANUP_THRESHOLD);
  });

  it('completeness is capped at 10', () => {
    const { completenessScore } = scoreRepo(emptyRepo, 'user');
    expect(completenessScore).toBe(10);
  });

  it('portfolio is 0', () => {
    const { portfolioScore } = scoreRepo(emptyRepo, 'user');
    expect(portfolioScore).toBe(0);
  });

  it('suggestion type is empty_repo with danger severity', () => {
    const { suggestions } = scoreRepo(emptyRepo, 'user');
    expect(suggestions.some(s => s.type === 'empty_repo' && s.severity === 'danger')).toBe(true);
  });
});

// ─── Cleanup reweights ────────────────────────────────────────────────────────

describe('cleanup reweights', () => {
  it('description-less but active repo scores cleanup < CLEANUP_THRESHOLD', () => {
    const now = Date.now();
    const repo = makeRepo({
      description: null,
      pushedAt: new Date(now - 10 * DAY_MS).toISOString(),
    });
    const { cleanupScore } = scoreRepo(repo, 'user');
    expect(cleanupScore).toBeLessThan(CLEANUP_THRESHOLD);
  });

  it('missing description contributes only 10 cleanup points (not 25)', () => {
    const now = Date.now();
    const repo = makeRepo({
      description: null,
      language: 'TypeScript',
      pushedAt: new Date(now - 10 * DAY_MS).toISOString(),
    });
    const { cleanupScore } = scoreRepo(repo, 'user');
    expect(cleanupScore).toBe(SCORE_WEIGHTS.cleanup.missingDescription);
  });

  it('dead repo (no push 24+ months, 0 stars) scores dead weight', () => {
    const now = Date.now();
    const repo = makeRepo({
      pushedAt: new Date(now - 800 * DAY_MS).toISOString(),
      updatedAt: new Date(now - 800 * DAY_MS).toISOString(),
      createdAt: new Date(now - 900 * DAY_MS).toISOString(),
      stargazersCount: 0,
      forksCount: 0,
    });
    const { cleanupScore } = scoreRepo(repo, 'user');
    // dead (+30) + missing? depends on description
    expect(cleanupScore).toBeGreaterThanOrEqual(SCORE_WEIGHTS.cleanup.dead);
  });

  it('stale repo (12-24 months, 0 stars) scores stale weight only', () => {
    const now = Date.now();
    const repo = makeRepo({
      pushedAt: new Date(now - 500 * DAY_MS).toISOString(),
      updatedAt: new Date(now - 500 * DAY_MS).toISOString(),
      createdAt: new Date(now - 600 * DAY_MS).toISOString(),
      description: 'Has description',
      language: 'TypeScript',
      stargazersCount: 0,
      forksCount: 0,
    });
    const { cleanupScore } = scoreRepo(repo, 'user');
    expect(cleanupScore).toBe(SCORE_WEIGHTS.cleanup.stale);
  });

  it('unmodified fork scores forkUnmodified weight', () => {
    const now = Date.now();
    const createdAt = new Date(now - 365 * DAY_MS).toISOString();
    const repo = makeRepo({
      fork: true,
      pushedAt: null,
      createdAt,
      description: 'Fork with no pushes',
      language: 'TypeScript',
    });
    const { cleanupScore } = scoreRepo(repo, 'user');
    expect(cleanupScore).toBe(SCORE_WEIGHTS.cleanup.forkUnmodified);
  });

  it('modified fork (pushed after 30 days) scores forkModified weight', () => {
    const now = Date.now();
    const createdAt = new Date(now - 365 * DAY_MS).toISOString();
    const pushedAt  = new Date(now - 60 * DAY_MS).toISOString();
    const repo = makeRepo({
      fork: true,
      createdAt,
      pushedAt,
      description: 'Modified fork',
      language: 'TypeScript',
    });
    const { cleanupScore } = scoreRepo(repo, 'user');
    expect(cleanupScore).toBe(SCORE_WEIGHTS.cleanup.forkModified);
  });
});

// ─── Grace period ─────────────────────────────────────────────────────────────

describe('new-project grace period', () => {
  it('repo created within 90 days is not penalised for staleness', () => {
    const now = Date.now();
    const repo = makeRepo({
      createdAt: new Date(now - 30 * DAY_MS).toISOString(),
      pushedAt:  new Date(now - 30 * DAY_MS).toISOString(),
      updatedAt: new Date(now - 30 * DAY_MS).toISOString(),
      description: null,
      language: 'TypeScript',
      stargazersCount: 0,
      forksCount: 0,
    });
    const { cleanupScore } = scoreRepo(repo, 'user');
    // Only missingDescription (10) applies; no stale/dead penalty
    expect(cleanupScore).toBe(SCORE_WEIGHTS.cleanup.missingDescription);
  });
});

// ─── Completeness tiering ─────────────────────────────────────────────────────

describe('completeness: topics tiering', () => {
  it('0 topics: no topics points', () => {
    const repo = makeRepo({ topics: [], description: null, language: null, licenseName: null });
    const { completenessScore } = scoreRepo(repo, 'user');
    expect(completenessScore).toBe(0);
  });

  it('1-2 topics: tier1 points (15)', () => {
    const repo = makeRepo({ topics: ['typescript'], description: null, language: null, licenseName: null });
    const { completenessScore } = scoreRepo(repo, 'user');
    expect(completenessScore).toBe(SCORE_WEIGHTS.completeness.topicsTier1);
  });

  it('3+ topics: tier2 points (25)', () => {
    const repo = makeRepo({ topics: ['typescript', 'angular', 'frontend'], description: null, language: null, licenseName: null });
    const { completenessScore } = scoreRepo(repo, 'user');
    expect(completenessScore).toBe(SCORE_WEIGHTS.completeness.topicsTier2);
  });

  it('all signals present: completeness = 100', () => {
    const repo = makeRepo({
      description: 'Full repo',
      language: 'TypeScript',
      topics: ['a', 'b', 'c'],
      licenseName: 'MIT',
    });
    const { completenessScore } = scoreRepo(repo, 'user');
    expect(completenessScore).toBe(100);
  });
});
