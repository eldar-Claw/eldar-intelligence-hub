import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportsRouter from './routes/reports';
import sourcesRouter from './routes/sources';
import settingsRouter from './routes/settings';
import logsRouter from './routes/logs';
import { startScheduler } from './services/scheduler';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3001');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/reports', reportsRouter);
app.use('/api/sources', sourcesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/logs', logsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);

  // Start the daily scheduler
  startScheduler();
});

export default app;
