import { Router } from 'express';
import { MockLlmProvider } from '../ai/mock.provider.js';
import { OpenAiProvider } from '../ai/openai.provider.js';
import { AnthropicProvider } from '../ai/anthropic.provider.js';
import { OllamaProvider } from '../ai/ollama.provider.js';

const router = Router();

function getProvider() {
  const p = (process.env.AI_PROVIDER || 'mock').toLowerCase();
  if (p === 'openai')    return new OpenAiProvider();
  if (p === 'anthropic') return new AnthropicProvider();
  if (p === 'ollama')    return new OllamaProvider();
  return new MockLlmProvider();
}

function getProviderStatus() {
  const p = (process.env.AI_PROVIDER || 'none').toLowerCase();
  if (p === 'openai')    return { provider: 'openai',    configured: !!process.env.OPENAI_API_KEY };
  if (p === 'anthropic') return { provider: 'anthropic', configured: !!process.env.ANTHROPIC_API_KEY };
  if (p === 'ollama')    return { provider: 'ollama',    configured: true };
  if (p === 'mock')      return { provider: 'mock',      configured: true };
  return { provider: 'none', configured: false };
}

router.get('/status', (req, res) => {
  res.json(getProviderStatus());
});

router.post('/analyse', async (req, res, next) => {
  try {
    const repos = req.body?.repos;
    if (!Array.isArray(repos) || repos.length === 0) {
      return res.status(400).json({ success: false, message: 'repos array is required.' });
    }

    // Mandatory AI boundary — private repos never reach any external provider.
    // Enforced here in backend code, not just UI.
    const publicOnly = repos.filter(r => r.private === false);

    if (publicOnly.length === 0) {
      return res.json({ results: [] });
    }

    const provider = getProvider();
    const results = await provider.analyzeRepos(publicOnly);
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

export default router;
