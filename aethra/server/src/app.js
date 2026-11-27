import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { pingDatabase } from './db/pool.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import imageRoutes from './routes/images.js';
import creationRoutes from './routes/creations.js';
import voiceRoutes from './routes/voice.js';
import settingsRoutes from './routes/settings.js';

const here = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);
app.use(
  cors({
    origin: env.clientUrl.split(',').map((url) => url.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.nodeEnv === 'test' ? 1000 : 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.nodeEnv === 'test' ? 1000 : 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts. Please try again in a few minutes.', code: 'RATE_LIMITED' } },
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/creations', creationRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', async (_req, res, next) => {
  try {
    const database = await pingDatabase() ? 'connected' : 'unavailable';
    res.json({
      status: 'ok',
      service: 'aethra-api',
      database,
      aiConfigured: Boolean(env.ai.apiKey),
      imageConfigured: Boolean(env.image.apiKey),
      time: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.use('/api', notFoundHandler);

// Serve the built SPA when deployed as a single process.
const clientDist = path.resolve(here, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(errorHandler);

export default app;
