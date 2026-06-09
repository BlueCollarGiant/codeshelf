const GITHUB_API = 'https://api.github.com';

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function getToken() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw { status: 401, tokenPresent: false, message: 'GitHub token not configured. Add GITHUB_TOKEN to your .env file.' };
  return token;
}

async function githubFetch(path, token) {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: authHeaders(token) });

  if (res.status === 401) throw { status: 401, message: 'GitHub token is invalid or expired. Check your GITHUB_TOKEN in .env.' };
  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      const reset = res.headers.get('x-ratelimit-reset');
      const resetTime = reset ? new Date(Number(reset) * 1000).toISOString() : 'unknown';
      throw { status: 429, message: `GitHub rate limit exceeded. Resets at ${resetTime}.` };
    }
    throw { status: 403, message: 'GitHub token does not have sufficient permissions for this operation.' };
  }
  if (!res.ok) throw { status: res.status, message: `GitHub API error (${res.status}). Try again later.` };

  return res;
}

export async function checkTokenStatus() {
  const token = getToken(); // throws {status:401, tokenPresent:false} if missing
  const res = await githubFetch('/rate_limit', token);
  const data = await res.json();

  return {
    tokenPresent: true,
    tokenValid: true,
    rateLimitRemaining: data.rate?.remaining ?? null,
    rateLimitReset: data.rate?.reset ? new Date(data.rate.reset * 1000).toISOString() : null,
    scopes: res.headers.get('x-oauth-scopes') ?? null,
  };
}

export async function getAuthenticatedUser() {
  const token = getToken();
  const res = await githubFetch('/user', token);
  return await res.json();
}

async function fetchRepoPage(token, page) {
  const res = await githubFetch(
    `/user/repos?per_page=100&page=${page}&sort=updated&direction=desc`,
    token,
  );
  const data = await res.json();
  const linkHeader = res.headers.get('link') ?? '';
  const hasNext = linkHeader.includes('rel="next"');
  return { data, hasNext };
}

export async function getAllRepos() {
  const token = getToken();
  const all = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const result = await fetchRepoPage(token, page);
    all.push(...result.data);
    hasNext = result.hasNext;
    page++;
  }

  return all;
}

export async function deleteRepo(fullName) {
  const token = getToken();
  const res = await fetch(`${GITHUB_API}/repos/${fullName}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

  if (res.status === 401) throw { status: 401, message: 'GitHub token is invalid or expired.' };
  if (res.status === 403) throw { status: 403, message: `Insufficient token scope to delete ${fullName}. Requires delete_repo scope (classic PAT) or Administration read/write (fine-grained PAT).` };
  if (res.status === 404) throw { status: 404, message: `Repository ${fullName} not found or not accessible.` };
  if (res.status === 204) return true;
  if (!res.ok) throw { status: res.status, message: `Failed to delete ${fullName} (${res.status}).` };

  return true;
}

export async function setRepoVisibility(fullName, visibility) {
  const token = getToken();
  const res = await fetch(`${GITHUB_API}/repos/${fullName}`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ private: visibility === 'private' }),
  });

  if (res.status === 401) throw { status: 401, message: 'GitHub token is invalid or expired.' };
  if (res.status === 403) throw { status: 403, message: `Insufficient token scope to change visibility of ${fullName}.` };
  if (res.status === 404) throw { status: 404, message: `Repository ${fullName} not found or not accessible.` };
  if (!res.ok) throw { status: res.status, message: `Failed to update ${fullName} (${res.status}).` };

  return true;
}
