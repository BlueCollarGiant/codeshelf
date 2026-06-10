import { describe, it, expect } from 'vitest';
import { classifyRepo } from './repo-classifier.utils';
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

describe('classifyRepo', () => {
  it('classifies profile repo when name matches owner login', () => {
    const repo = makeRepo({ name: 'octocat' });
    const result = classifyRepo(repo, 'octocat');
    expect(result.type).toBe('profile_repo');
    expect(result.protected).toBe(true);
  });

  it('profile repo match is case-insensitive', () => {
    const repo = makeRepo({ name: 'OctoCat' });
    const result = classifyRepo(repo, 'octocat');
    expect(result.type).toBe('profile_repo');
  });

  it('classifies archived before empty_repo', () => {
    const repo = makeRepo({ archived: true, size: 0, language: null });
    const result = classifyRepo(repo, 'user');
    expect(result.type).toBe('archived');
  });

  it('classifies fork before empty_repo (forks can report size 0)', () => {
    const repo = makeRepo({ fork: true, size: 0, language: null });
    const result = classifyRepo(repo, 'user');
    expect(result.type).toBe('fork');
  });

  it('classifies empty_repo when size is 0 and language is null', () => {
    const repo = makeRepo({ size: 0, language: null, fork: false, archived: false });
    const result = classifyRepo(repo, 'user');
    expect(result.type).toBe('empty_repo');
    expect(result.protected).toBe(false);
  });

  it('does not classify as empty_repo when size is 0 but language is set (single-file repo)', () => {
    const repo = makeRepo({ size: 0, language: 'Markdown' });
    const result = classifyRepo(repo, 'user');
    expect(result.type).not.toBe('empty_repo');
  });

  it('classifies template repo', () => {
    const repo = makeRepo({ name: 'my-template' });
    const result = classifyRepo(repo, 'user');
    expect(result.type).toBe('template');
  });

  it('classifies config/dotfiles repo by name', () => {
    const repo = makeRepo({ name: 'dotfiles' });
    const result = classifyRepo(repo, 'user');
    expect(result.type).toBe('config_or_dotfiles');
  });

  it('classifies portfolio_project: public, described, has language, recent', () => {
    const now = Date.now();
    const repo = makeRepo({
      private: false,
      description: 'A great project',
      language: 'Go',
      pushedAt: new Date(now - 10 * DAY_MS).toISOString(),
    });
    const result = classifyRepo(repo, 'user');
    expect(result.type).toBe('portfolio_project');
  });

  it('uses pushedAt over updatedAt for recency in classification', () => {
    const now = Date.now();
    // updatedAt is old, pushedAt is recent
    const repo = makeRepo({
      private: false,
      description: 'A project',
      language: 'Go',
      updatedAt: new Date(now - 400 * DAY_MS).toISOString(),
      pushedAt: new Date(now - 10 * DAY_MS).toISOString(),
    });
    const result = classifyRepo(repo, 'user');
    // Should be portfolio_project because pushedAt is recent
    expect(result.type).toBe('portfolio_project');
  });

  it('classifies old_learning_repo when inactive 24+ months with no signals', () => {
    const now = Date.now();
    const repo = makeRepo({
      description: null,
      language: null,
      stargazersCount: 0,
      forksCount: 0,
      pushedAt: new Date(now - 800 * DAY_MS).toISOString(),
      updatedAt: new Date(now - 800 * DAY_MS).toISOString(),
    });
    const result = classifyRepo(repo, 'user');
    expect(result.type).toBe('old_learning_repo');
  });
});
