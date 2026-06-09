/**
 * Whitelist-only sanitizer. Only fields listed here ever reach the frontend.
 * Raw GitHub API objects are never forwarded.
 */
export function sanitizeRepo(raw) {
  return {
    id:               raw.id,
    name:             raw.name,
    fullName:         raw.full_name,
    description:      raw.description ?? null,
    htmlUrl:          raw.html_url,
    private:          raw.private,
    fork:             raw.fork,
    archived:         raw.archived,
    disabled:         raw.disabled,
    visibility:       raw.visibility,
    language:         raw.language ?? null,
    stargazersCount:  raw.stargazers_count,
    forksCount:       raw.forks_count,
    openIssuesCount:  raw.open_issues_count,
    defaultBranch:    raw.default_branch,
    topics:           Array.isArray(raw.topics) ? raw.topics : [],
    createdAt:        raw.created_at,
    updatedAt:        raw.updated_at,
    pushedAt:         raw.pushed_at ?? null,
    size:             raw.size,
    hasIssues:        raw.has_issues,
    hasProjects:      raw.has_projects,
    hasWiki:          raw.has_wiki,
    licenseName:      raw.license?.name ?? null,
  };
}

export function sanitizeUser(raw) {
  return {
    login:      raw.login,
    name:       raw.name ?? null,
    avatarUrl:  raw.avatar_url,
    profileUrl: raw.html_url,
  };
}
