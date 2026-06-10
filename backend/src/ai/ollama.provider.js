import { toAiSafePayload, normalizeResults, RESULT_SHAPE, TYPE_RULES } from './shared.js';

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
    return normalizeResults(jsonMatch ? jsonMatch[0] : '{}', repos);
  }
}

function buildPrompt(repos) {
  return `Analyse these GitHub repositories and return ONLY a JSON object with a "results" array. Each item must have:
${RESULT_SHAPE}

${TYPE_RULES}

Repositories:
${JSON.stringify(toAiSafePayload(repos))}`;
}
