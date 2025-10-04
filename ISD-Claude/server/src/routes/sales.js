import express from 'express';
import { body, validationResult } from 'express-validator';
import { Sale } from '../models/Sale.js';
import { Product } from '../models/Product.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all sales
router.get('/', authenticateToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const sales = Sale.getAll(limit, offset);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales by date range
router.get('/date-range', authenticateToken, (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required' });
    }
    const sales = Sale.getByDateRange(startDate, endDate);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue by period
router.get('/revenue', authenticateToken, (req, res) => {
  try {
    const period = req.query.period || 'day';
    const limit = parseInt(req.query.limit) || 30;
    const revenue = Sale.getRevenueByPeriod(period, limit);
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top products
router.get('/top-products', authenticateToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { startDate, endDate } = req.query;
    const topProducts = Sale.getTopProducts(limit, startDate, endDate);
    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
router.get('/dashboard-stats', authenticateToken, (req, res) => {
  try {
    const stats = Sale.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sale by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const sale = Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create sale
router.post('/',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  body('product_id').isInt(),
  body('quantity').isInt({ min: 1 }),
  body('unit_price').isFloat({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { product_id, quantity } = req.body;

      // Check product exists and has enough stock
      const product = Product.findById(product_id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (product.stock_quantity < quantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          available: product.stock_quantity,
          requested: quantity
        });
      }

      const saleId = Sale.create({
        ...req.body,
        created_by: req.user.id
      });

      const sale = Sale.findById(saleId);
      res.status(201).json(sale);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete sale
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  (req, res) => {
    try {
      const sale = Sale.findById(req.params.id);
      if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
      }

      Sale.delete(req.params.id);
      res.json({ message: 'Sale deleted successfully and stock restored' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
