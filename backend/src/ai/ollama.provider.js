const OLLAMA_API = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

export class OllamaProvider {
  async analyzeRepos(repos) {
    const prompt = buildPrompt(repos);
    const res = await fetch(`${OLLAMA_API}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false, format: 'json' }),
    }).catch(() => { throw { status: 503, message: 'Cannot reach Ollama. Is it running at ' + OLLAMA_API + '?' }; });

    if (!res.ok) throw { status: res.status, message: `Ollama request failed (${res.status}).` };

    const data = await res.json();
    const jsonMatch = (data.response ?? '').match(/\{[\s\S]*\}/);
    return parseResults(jsonMatch ? jsonMatch[0] : '{}', repos);
  }
}

function buildPrompt(repos) {
  const list = repos.map(r => ({
    id: r.id, name: r.name, description: r.description, language: r.language,
    stars: r.stargazersCount, fork: r.fork, archived: r.archived, hasLicense: !!r.licenseName,
  }));
  return `Analyse these GitHub repositories and return ONLY a JSON object with a "results" array. Each item: repoId, repoName, skillRating (0-100), professionalismRating (0-100), suggestDeletion (bool), suggestMakePrivate (bool), summary (string), flags (string[]).\n\n${JSON.stringify(list)}`;
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
    return repos.map(r => ({ repoId: r.id, repoName: r.name, skillRating: 50, professionalismRating: 50, suggestDeletion: false, suggestMakePrivate: false, summary: 'Analysis unavailable.', flags: [] }));
  }
}

function clamp(n) { return Math.max(0, Math.min(100, isNaN(n) ? 50 : n)); }
