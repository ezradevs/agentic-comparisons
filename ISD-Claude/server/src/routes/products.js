import express from 'express';
import { body, validationResult } from 'express-validator';
import { Product } from '../models/Product.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', authenticateToken, (req, res) => {
  try {
    const products = Product.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock products
router.get('/low-stock', authenticateToken, (req, res) => {
  try {
    const products = Product.getLowStock();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product categories
router.get('/categories', authenticateToken, (req, res) => {
  try {
    const categories = Product.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const product = Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  body('name').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('sku').notEmpty().trim(),
  body('cost_price').isFloat({ min: 0 }),
  body('sale_price').isFloat({ min: 0 }),
  body('stock_quantity').isInt({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      if (Product.findBySku(req.body.sku)) {
        return res.status(400).json({ error: 'SKU already exists' });
      }

      const productId = Product.create(req.body);
      const product = Product.findById(productId);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update product
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  body('name').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('sku').notEmpty().trim(),
  body('cost_price').isFloat({ min: 0 }),
  body('sale_price').isFloat({ min: 0 }),
  body('stock_quantity').isInt({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existing = Product.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const skuCheck = Product.findBySku(req.body.sku);
      if (skuCheck && skuCheck.id !== parseInt(req.params.id)) {
        return res.status(400).json({ error: 'SKU already exists' });
      }

      Product.update(req.params.id, req.body);
      const product = Product.findById(req.params.id);
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete product
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  (req, res) => {
    try {
      const product = Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      Product.delete(req.params.id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
