import './config/env.js';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import githubRoutes from './routes/github.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:4200';

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
