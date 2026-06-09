const OPENAI_API = 'https://api.openai.com/v1/chat/completions';

export class OpenAiProvider {
  async analyzeRepos(repos) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw { status: 503, message: 'OPENAI_API_KEY not configured.' };

    const prompt = buildPrompt(repos);
    const res = await fetch(OPENAI_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw { status: res.status, message: sanitizeAiError(err, res.status) };
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? '{}';
    return parseResults(text, repos);
  }
}

function buildPrompt(repos) {
  const list = repos.map(r => ({
    id: r.id, name: r.name, description: r.description, language: r.language,
    topics: r.topics, stars: r.stargazersCount, forks: r.forksCount,
    updatedAt: r.updatedAt, fork: r.fork, archived: r.archived, hasLicense: !!r.licenseName,
  }));

  return `You are reviewing a developer's public GitHub repositories to help them understand their portfolio quality.

Analyse each repository and return a JSON object with a "results" array. Each item must have:
- repoId: number (the id field)
- repoName: string
- skillRating: number 0-100 (coding skill demonstrated)
- professionalismRating: number 0-100 (docs, description, topics, license quality)
- suggestDeletion: boolean
- suggestMakePrivate: boolean
- summary: string (2-3 sentences, honest and constructive)
- flags: string[] (e.g. ["no-description", "is-fork", "stale", "good-readme"])

Be honest but constructive. These are personal repos — not commercial products.

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
  if (status === 401) return 'OpenAI API key is invalid or expired.';
  if (status === 429) return 'OpenAI rate limit or quota exceeded.';
  if (status === 503) return 'OpenAI service unavailable. Try again later.';
  return `OpenAI request failed (${status}).`;
}
