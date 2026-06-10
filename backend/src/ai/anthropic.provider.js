import { toAiSafePayload, normalizeResults, RESULT_SHAPE } from './shared.js';

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
        model: 'claude-opus-4-8',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      throw { status: res.status, message: sanitizeAiError(res.status) };
    }

    const data = await res.json();
    const text = data.content?.[0]?.text ?? '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return normalizeResults(jsonMatch ? jsonMatch[0] : '{}', repos);
  }
}

function buildPrompt(repos) {
  return `You are reviewing a developer's public GitHub repositories to help them understand their portfolio quality.

Analyse each repository and return ONLY a JSON object (no markdown, no prose) with a "results" array. Each item must have:
${RESULT_SHAPE}

Be honest but constructive. These are personal repos — not commercial products.

Repositories:
${JSON.stringify(toAiSafePayload(repos), null, 2)}`;
}

function sanitizeAiError(status) {
  if (status === 401) return 'Anthropic API key is invalid or expired.';
  if (status === 429) return 'Anthropic rate limit exceeded.';
  if (status === 529) return 'Anthropic service overloaded. Try again later.';
  return `Anthropic request failed (${status}).`;
}
