import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware';
import { announcementService } from '../services/announcementService';
import { announcementCreateSchema, announcementUpdateSchema } from '../types/schemas';
import { parse } from '../utils/http';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => {
  const { activeOnly } = req.query;
  const announcements = announcementService.list(activeOnly === 'true');
  res.json({ announcements });
});

router.post('/', (req: AuthenticatedRequest, res, next) => {
  try {
    const payload = parse(announcementCreateSchema, req.body);
    const announcement = announcementService.create({ ...payload, created_by: req.user?.id });
    res.status(201).json({ announcement });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', (req: AuthenticatedRequest, res, next) => {
  try {
    const payload = parse(announcementUpdateSchema, req.body);
    const announcement = announcementService.update(req.params.id, payload);
    res.json({ announcement });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    announcementService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
