import './config/env.js';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import githubRoutes from './routes/github.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();

// CORS stays localhost-only. ALLOWED_ORIGIN exists to support a non-default
// frontend port — non-localhost values are rejected and the default is used.
const DEFAULT_ORIGIN = 'http://localhost:4200';
const requestedOrigin = process.env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
const isLocalhostOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestedOrigin);
if (!isLocalhostOrigin) {
  console.warn(`[backend] ALLOWED_ORIGIN "${requestedOrigin}" is not a localhost origin - falling back to ${DEFAULT_ORIGIN}`);
}
const ALLOWED_ORIGIN = isLocalhostOrigin ? requestedOrigin : DEFAULT_ORIGIN;

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[backend] Running at http://127.0.0.1:${PORT}`);
});
