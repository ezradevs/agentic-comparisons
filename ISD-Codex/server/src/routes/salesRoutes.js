const express = require('express');
const { z } = require('zod');
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');
const { requireRole } = require('../middleware/auth');
const saleService = require('../services/saleService');
const { resolveCustomer } = require('../services/customerService');
const { salesReport } = require('../services/reportService');

const router = express.Router();

const saleSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  saleDate: z.string().datetime().optional(),
  customerId: z.number().int().positive().optional(),
  customerName: z.string().min(2).optional(),
});

router.get('/', requireRole('staff', 'viewer'), (req, res) => {
  const { from, to, productId } = req.query;
  const filters = {};
  if (from) filters.from = from;
  if (to) filters.to = to;
  if (productId) filters.productId = Number(productId);
  const sales = saleService.listSales(filters);
  res.json(sales);
});

router.post('/', requireRole('staff'), (req, res) => {
  try {
    const payload = saleSchema.parse(req.body);
    const customerRef = resolveCustomer({
      customerId: payload.customerId,
      customerName: payload.customerName,
    });
    const sale = saleService.createSale({
      productId: payload.productId,
      quantity: payload.quantity,
      saleDate: payload.saleDate,
      ...customerRef,
    });
    res.status(201).json(sale);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.message, issues: err.issues });
    }
    res.status(400).json({ message: err.message });
  }
});

router.get('/summary', requireRole('viewer', 'staff'), (req, res) => {
  const period = req.query.period || 'daily';
  const report = salesReport(period);
  res.json(report);
});

router.get('/export', requireRole('viewer', 'staff'), (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();
  const sales = saleService.listSales({ from: req.query.from, to: req.query.to });

  if (format === 'pdf') {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const filename = `sales-${dayjs().format('YYYYMMDD-HHmm')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);
    doc.fontSize(18).text('Sales Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10);

    sales.forEach((sale) => {
      doc.text(
        `${dayjs(sale.saleDate).format('YYYY-MM-DD')} | ${sale.productName} | qty ${sale.quantity} | revenue $${sale.revenue.toFixed(2)}`
      );
    });
    doc.end();
    return;
  }

  const header = 'Date,Product,Quantity,Revenue,Profit\n';
  const rows = sales
    .map((sale) =>
      [
        dayjs(sale.saleDate).format('YYYY-MM-DD'),
        sale.productName,
        sale.quantity,
        sale.revenue.toFixed(2),
        sale.profit.toFixed(2),
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
  const filename = `sales-${dayjs().format('YYYYMMDD-HHmm')}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(header + rows);
});

module.exports = router;
