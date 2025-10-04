import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login',
  body('username').notEmpty().trim(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password } = req.body;
      const user = User.findByUsername(username);

      if (!user || !User.verifyPassword(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Register (admin only)
router.post('/register',
  authenticateToken,
  body('username').notEmpty().trim().isLength({ min: 3 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'staff', 'viewer']),
  async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create users' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password, role } = req.body;

      if (User.findByUsername(username)) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      if (User.findByEmail(email)) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const userId = User.create({ username, email, password, role });
      const user = User.findById(userId);

      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  const user = User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// Change password
router.put('/change-password',
  authenticateToken,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { currentPassword, newPassword } = req.body;
      const user = User.findById(req.user.id);

      if (!User.verifyPassword(currentPassword, user.password)) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      User.updatePassword(req.user.id, newPassword);
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
