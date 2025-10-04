import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/',
  authenticateToken,
  authorizeRoles('admin'),
  (req, res) => {
    try {
      const users = User.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get user by ID (admin only)
router.get('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  (req, res) => {
    try {
      const user = User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update user (admin only)
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  body('username').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('role').isIn(['admin', 'staff', 'viewer']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existing = User.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'User not found' });
      }

      User.update(req.params.id, req.body);
      const user = User.findById(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete user (admin only)
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  (req, res) => {
    try {
      if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const user = User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      User.delete(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
