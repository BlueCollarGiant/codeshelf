import { Router } from 'express';
import { MockLlmProvider } from '../ai/mock.provider.js';
import { OpenAiProvider } from '../ai/openai.provider.js';
import { AnthropicProvider } from '../ai/anthropic.provider.js';
import { OllamaProvider } from '../ai/ollama.provider.js';

const router = Router();

const KNOWN_PROVIDERS = new Set(['openai', 'anthropic', 'ollama', 'mock']);

function resolveProviderName() {
  const p = (process.env.AI_PROVIDER || 'none').toLowerCase();
  return KNOWN_PROVIDERS.has(p) ? p : 'none';
}

function getProvider() {
  const p = resolveProviderName();
  if (p === 'openai')    return new OpenAiProvider();
  if (p === 'anthropic') return new AnthropicProvider();
  if (p === 'ollama')    return new OllamaProvider();
  if (p === 'mock')      return new MockLlmProvider();
  return null;
}

function getProviderStatus() {
  const p = resolveProviderName();
  if (p === 'openai')    return { provider: 'openai',    configured: !!process.env.OPENAI_API_KEY };
  if (p === 'anthropic') return { provider: 'anthropic', configured: !!process.env.ANTHROPIC_API_KEY };
  if (p === 'ollama')    return { provider: 'ollama',    configured: true };
  if (p === 'mock')      return { provider: 'mock',      configured: true };
  return { provider: 'none', configured: false };
}

router.get('/status', (req, res) => {
  res.json(getProviderStatus());
});

const BATCH_SIZE = 12;

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

router.post('/analyse', async (req, res, next) => {
  try {
    const repos = req.body?.repos;
    if (!Array.isArray(repos) || repos.length === 0) {
      return res.status(400).json({ success: false, message: 'repos array is required.' });
    }

    const provider = getProvider();
    if (!provider) {
      return res.status(503).json({ success: false, message: 'AI analysis is disabled. Set AI_PROVIDER in .env to enable it.' });
    }

    // Mandatory AI boundary: private repos never reach any external provider.
    // Enforced here in backend code, not just UI.
    const publicOnly = repos.filter(r => r.private === false);

    if (publicOnly.length === 0) {
      return res.json({ results: [] });
    }

    const batches = chunkArray(publicOnly, BATCH_SIZE);
    const allResults = [];
    const warnings = [];
    let successCount = 0;
    let firstError = null;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      try {
        const batchResults = await provider.analyzeRepos(batch);
        if (batchResults === null) {
          warnings.push(`Batch ${i + 1} of ${batches.length} returned unparseable output (${batch.length} repos skipped).`);
        } else {
          allResults.push(...batchResults);
          successCount++;
        }
      } catch (err) {
        if (!firstError) firstError = err;
        warnings.push(`Batch ${i + 1} of ${batches.length} failed (${batch.length} repos skipped).`);
      }
    }

    // When nothing succeeded, surface the first batch's actual error so an
    // actionable cause (e.g. a missing API key, 503) reaches the user instead
    // of a generic message. These provider messages are already sanitized and
    // never contain the token. Fall back to 502 for pure parse failures.
    if (successCount === 0) {
      return res.status(firstError?.status ?? 502).json({
        success: false,
        message: firstError?.message
          ? `AI analysis failed: ${firstError.message}`
          : 'AI analysis failed: all batches returned unparseable output.',
      });
    }

    const response = { results: allResults };
    if (warnings.length > 0) response.warnings = warnings;
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
