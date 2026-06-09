/**
 * LlmProvider interface contract.
 * All providers must implement analyzeRepos(repos) => Promise<RepoAiResult[]>
 *
 * repos: SafeGitHubRepo[] — guaranteed private === false before reaching any provider
 *
 * RepoAiResult shape:
 * {
 *   repoId:               number
 *   repoName:             string
 *   skillRating:          number (0-100)
 *   professionalismRating: number (0-100)
 *   suggestDeletion:      boolean
 *   suggestMakePrivate:   boolean
 *   summary:              string
 *   flags:                string[]
 * }
 */

// No runtime code — this file documents the interface contract only.
// Each provider exports a class with: analyzeRepos(repos: object[]): Promise<object[]>
export {};
