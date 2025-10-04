import { Router } from 'express';
import { authService } from '../services/authService';
import { loginSchema } from '../types/schemas';
import { parse } from '../utils/http';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const credentials = parse(loginSchema, req.body);
    const result = await authService.login(credentials.email, credentials.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/profile', authenticate, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

export default router;
