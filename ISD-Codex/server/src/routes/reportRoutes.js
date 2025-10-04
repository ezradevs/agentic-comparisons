const express = require('express');
const { requireRole } = require('../middleware/auth');
const { salesReport, inventorySnapshot, aggregateSales } = require('../services/reportService');
const saleService = require('../services/saleService');
const { getLowStockProducts } = require('../services/productService');

const router = express.Router();

router.get('/dashboard', requireRole('viewer', 'staff'), (_req, res) => {
  const revenueByDay = saleService.getRevenueByPeriod('day');
  const revenueByMonth = saleService.getRevenueByPeriod('month');
  const bestSeller = saleService.getBestSellerThisWeek();
  const summary = saleService.getSummary();
  const lowStock = getLowStockProducts();
  const topProducts = saleService.getTopProducts(5, 30);

  res.json({
    revenueByDay,
    revenueByMonth,
    bestSeller,
    summary,
    lowStock,
    topProducts,
  });
});

router.get('/period', requireRole('viewer', 'staff'), (req, res) => {
  const period = req.query.period || 'daily';
  res.json(salesReport(period));
});

router.get('/inventory', requireRole('viewer', 'staff'), (_req, res) => {
  res.json({ items: inventorySnapshot() });
});

router.get('/totals', requireRole('viewer', 'staff'), (req, res) => {
  const { from, to } = req.query;
  res.json(aggregateSales({ from, to }));
});

module.exports = router;
