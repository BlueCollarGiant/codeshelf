import { Router } from 'express';
import { checkTokenStatus, getAuthenticatedUser, getAllRepos, setRepoVisibility, deleteRepo } from '../services/github.service.js';
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

router.post('/repos/visibility', async (req, res, next) => {
  if (req.headers['x-codeshelf-action'] !== 'visibility') {
    return res.status(400).json({ success: false, message: 'Missing or invalid X-CodeShelf-Action header.' });
  }

  const { repos } = req.body;
  if (!Array.isArray(repos) || repos.length === 0) {
    return res.status(400).json({ success: false, message: 'Request body must include a non-empty repos array.' });
  }

  const VALID_VISIBILITY = new Set(['private', 'public']);
  for (const item of repos) {
    if (typeof item.fullName !== 'string' || !VALID_VISIBILITY.has(item.visibility)) {
      return res.status(400).json({ success: false, message: 'Each repo must have fullName (string) and visibility ("private" or "public").' });
    }
  }

  const results = [];
  for (const { fullName, visibility } of repos) {
    try {
      await setRepoVisibility(fullName, visibility);
      results.push({ fullName, visibility, success: true });
    } catch (err) {
      results.push({ fullName, visibility, success: false, message: err.message ?? 'Unknown error.' });
    }
  }

  res.json({ success: true, results });
});

router.post('/repos/delete', async (req, res, next) => {
  if (req.headers['x-codeshelf-action'] !== 'delete') {
    return res.status(400).json({ success: false, message: 'Missing or invalid X-CodeShelf-Action header.' });
  }

  const { repos } = req.body;
  if (!Array.isArray(repos) || repos.length === 0) {
    return res.status(400).json({ success: false, message: 'Request body must include a non-empty repos array.' });
  }

  for (const item of repos) {
    if (typeof item.fullName !== 'string' || !item.fullName.includes('/')) {
      return res.status(400).json({ success: false, message: 'Each repo must have a valid fullName (owner/repo).' });
    }
  }

  const results = [];
  for (const { fullName } of repos) {
    try {
      await deleteRepo(fullName);
      results.push({ fullName, success: true, status: 'deleted' });
    } catch (err) {
      results.push({ fullName, success: false, status: 'failed', message: err.message ?? 'Unknown error.' });
      if (err.status === 401) break;
    }
  }

  res.json({ success: true, results });
});

export default router;
