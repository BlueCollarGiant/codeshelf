const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

export class AnthropicProvider {
  async analyzeRepos(repos) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw { status: 503, message: 'ANTHROPIC_API_KEY not configured.' };

    const prompt = buildPrompt(repos);
    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw { status: res.status, message: sanitizeAiError(err, res.status) };
    }

    const data = await res.json();
    const text = data.content?.[0]?.text ?? '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return parseResults(jsonMatch ? jsonMatch[0] : '{}', repos);
  }
}

function buildPrompt(repos) {
  const list = repos.map(r => ({
    id: r.id, name: r.name, description: r.description, language: r.language,
    topics: r.topics, stars: r.stargazersCount, forks: r.forksCount,
    updatedAt: r.updatedAt, fork: r.fork, archived: r.archived, hasLicense: !!r.licenseName,
  }));

  return `You are reviewing a developer's public GitHub repositories to help them understand their portfolio quality.

Analyse each repository and return ONLY a JSON object (no markdown, no prose) with a "results" array. Each item must have:
- repoId: number
- repoName: string
- skillRating: number 0-100
- professionalismRating: number 0-100
- suggestDeletion: boolean
- suggestMakePrivate: boolean
- summary: string (2-3 sentences)
- flags: string[]

Repositories:
${JSON.stringify(list, null, 2)}`;
}

function parseResults(text, repos) {
  try {
    const parsed = JSON.parse(text);
    const results = Array.isArray(parsed.results) ? parsed.results : [];
    return results.map(r => ({
      repoId:               Number(r.repoId),
      repoName:             String(r.repoName ?? ''),
      skillRating:          clamp(Number(r.skillRating ?? 50)),
      professionalismRating: clamp(Number(r.professionalismRating ?? 50)),
      suggestDeletion:      Boolean(r.suggestDeletion),
      suggestMakePrivate:   Boolean(r.suggestMakePrivate),
      summary:              String(r.summary ?? ''),
      flags:                Array.isArray(r.flags) ? r.flags.map(String) : [],
    }));
  } catch {
    return repos.map(r => fallback(r));
  }
}

function fallback(repo) {
  return { repoId: repo.id, repoName: repo.name, skillRating: 50, professionalismRating: 50, suggestDeletion: false, suggestMakePrivate: false, summary: 'Analysis unavailable.', flags: [] };
}

function clamp(n) { return Math.max(0, Math.min(100, isNaN(n) ? 50 : n)); }

function sanitizeAiError(err, status) {
  if (status === 401) return 'Anthropic API key is invalid or expired.';
  if (status === 429) return 'Anthropic rate limit exceeded.';
  if (status === 529) return 'Anthropic service overloaded. Try again later.';
  return `Anthropic request failed (${status}).`;
}
