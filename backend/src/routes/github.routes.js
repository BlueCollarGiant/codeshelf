import { Router } from 'express';
import { checkTokenStatus, getAuthenticatedUser, getAllRepos } from '../services/github.service.js';
import { sanitizeRepo, sanitizeUser } from '../utils/sanitize.js';

const router = Router();

router.get('/status', async (req, res, next) => {
  try {
    const status = await checkTokenStatus();
    res.json(status);
  } catch (err) {
    if (err.status === 401) {
      return res.json({ tokenPresent: err.tokenPresent ?? true, tokenValid: false, rateLimitRemaining: null, rateLimitReset: null, scopes: null });
    }
    next(err);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const raw = await getAuthenticatedUser();
    res.json(sanitizeUser(raw));
  } catch (err) {
    next(err);
  }
});

router.get('/repos', async (req, res, next) => {
  try {
    const raw = await getAllRepos();
    res.json(raw.map(sanitizeRepo));
  } catch (err) {
    next(err);
  }
});

export default router;
