const express = require('express');
const { z } = require('zod');
const {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  findProductBySku,
  getLowStockProducts,
} = require('../services/productService');
const { requireRole } = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

const productSchema = z.object({
  name: z.string().min(2),
  category: z.string().optional().nullable(),
  sku: z.string().min(2),
  costPrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  stockQuantity: z.number().int().nonnegative(),
  supplier: z.string().optional().nullable(),
  reorderLevel: z.number().int().nonnegative().optional(),
});

router.get('/', requireRole('staff', 'viewer'), (_req, res) => {
  res.json(listProducts());
});

router.get('/low-stock', requireRole('staff', 'viewer'), (_req, res) => {
  res.json(getLowStockProducts(config.lowStockThreshold));
});

router.get('/:id', requireRole('staff', 'viewer'), (req, res) => {
  const product = getProductById(Number(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

router.post('/', requireRole('admin'), (req, res) => {
  try {
    const payload = productSchema.parse(req.body);
    if (findProductBySku(payload.sku)) {
      return res.status(409).json({ message: 'A product with this SKU already exists' });
    }
    const product = createProduct(payload);
    res.status(201).json(product);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.message, issues: err.issues });
    }
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', requireRole('admin'), (req, res) => {
  const id = Number(req.params.id);
  if (!getProductById(id)) {
    return res.status(404).json({ message: 'Product not found' });
  }
  try {
    const payload = productSchema.parse(req.body);
    const product = updateProduct(id, payload);
    res.json(product);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.message, issues: err.issues });
    }
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const id = Number(req.params.id);
  if (!getProductById(id)) {
    return res.status(404).json({ message: 'Product not found' });
  }
  deleteProduct(id);
  res.status(204).send();
});

module.exports = router;
