const express = require('express');
const { z } = require('zod');
const { authenticate, createUser, listUsers } = require('../services/authService');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'staff', 'viewer']),
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = authenticate(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

router.get('/users', requireRole('admin'), (_req, res) => {
  const users = listUsers();
  res.json(users);
});

router.post('/users', requireRole('admin'), (req, res) => {
  try {
    const payload = createUserSchema.parse(req.body);
    const user = createUser(payload);
    res.status(201).json(user);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.message, issues: err.issues });
    }
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
