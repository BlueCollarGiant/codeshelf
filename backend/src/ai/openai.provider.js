import { toAiSafePayload, normalizeResults, RESULT_SHAPE } from './shared.js';

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
      throw { status: res.status, message: sanitizeAiError(res.status) };
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? '{}';
    return normalizeResults(text, repos);
  }
}

function buildPrompt(repos) {
  return `You are reviewing a developer's public GitHub repositories to help them understand their portfolio quality.

Analyse each repository and return a JSON object with a "results" array. Each item must have:
${RESULT_SHAPE}

Be honest but constructive. These are personal repos, not commercial products.

Repositories:
${JSON.stringify(toAiSafePayload(repos), null, 2)}`;
}

function sanitizeAiError(status) {
  if (status === 401) return 'OpenAI API key is invalid or expired.';
  if (status === 429) return 'OpenAI rate limit or quota exceeded.';
  if (status === 503) return 'OpenAI service unavailable. Try again later.';
  return `OpenAI request failed (${status}).`;
}
