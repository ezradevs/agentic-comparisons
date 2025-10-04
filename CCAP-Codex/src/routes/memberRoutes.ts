import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { memberService } from '../services/memberService';
import { memberCreateSchema, memberUpdateSchema } from '../types/schemas';
import { parse } from '../utils/http';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => {
  const { status, search } = req.query;
  const members = memberService.list({
    status: typeof status === 'string' ? (status as any) : undefined,
    search: typeof search === 'string' ? search : undefined
  });
  res.json({ members });
});

router.get('/stats/by-status', (_req, res) => {
  const stats = memberService.countByStatus();
  res.json({ stats });
});

router.get('/:id', (req, res, next) => {
  try {
    const member = memberService.getById(req.params.id);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.json({ member });
  } catch (error) {
    next(error);
  }
});

router.post('/', (req, res, next) => {
  try {
    const payload = parse(memberCreateSchema, req.body);
    const member = memberService.create(payload);
    res.status(201).json({ member });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const payload = parse(memberUpdateSchema, req.body);
    const member = memberService.update(req.params.id, payload);
    res.json({ member });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    memberService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
