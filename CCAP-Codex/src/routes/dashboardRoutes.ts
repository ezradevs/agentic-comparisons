import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { dashboardService } from '../services/dashboardService';

const router = Router();

router.use(authenticate);

router.get('/metrics', (_req, res) => {
  const metrics = dashboardService.getMetrics();
  res.json({ metrics });
});

export default router;
