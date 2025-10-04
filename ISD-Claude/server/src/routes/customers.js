import express from 'express';
import { body, validationResult } from 'express-validator';
import { Customer } from '../models/Customer.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, (req, res) => {
  try {
    const customers = Customer.getAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const customer = Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer purchase history
router.get('/:id/history', authenticateToken, (req, res) => {
  try {
    const history = Customer.getPurchaseHistory(req.params.id);
    const stats = Customer.getCustomerStats(req.params.id);
    res.json({ history, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer
router.post('/',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  body('name').notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const customerId = Customer.create(req.body);
      const customer = Customer.findById(customerId);
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update customer
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  body('name').notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existing = Customer.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      Customer.update(req.params.id, req.body);
      const customer = Customer.findById(req.params.id);
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete customer
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  (req, res) => {
    try {
      const customer = Customer.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      Customer.delete(req.params.id);
      res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
