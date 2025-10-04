import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import memberRoutes from './routes/memberRoutes';
import eventRoutes from './routes/eventRoutes';
import announcementRoutes from './routes/announcementRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './middleware/errorHandler';
import { runMigrations } from './db/migrations';

export const createApp = () => {
  runMigrations();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/members', memberRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(errorHandler);

  return app;
};
