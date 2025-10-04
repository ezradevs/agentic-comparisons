const dayjs = require('dayjs');
const db = require('../db');
const productService = require('./productService');

const createSaleTx = db.transaction(({ productId, quantity, saleDate, customerId, customerName }) => {
  const product = db
    .prepare(`
      SELECT id, name, sale_price AS salePrice, cost_price AS costPrice, stock_quantity AS stockQuantity
      FROM products WHERE id = ?
    `)
    .get(productId);

  if (!product) {
    throw new Error('Product not found');
  }
  if (product.stockQuantity < quantity) {
    throw new Error('Insufficient stock');
  }

  const unitPrice = product.salePrice;
  const costPrice = product.costPrice;
  const revenue = unitPrice * quantity;
  const profit = (unitPrice - costPrice) * quantity;
  const saleDateIso = saleDate ? dayjs(saleDate).toISOString() : dayjs().toISOString();

  const insertStmt = db.prepare(`
    INSERT INTO sales (product_id, quantity, sale_date, unit_price, cost_price, revenue, profit, customer_id, customer_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insertStmt.run(
    productId,
    quantity,
    saleDateIso,
    unitPrice,
    costPrice,
    revenue,
    profit,
    customerId ?? null,
    customerName ?? null
  );

  db.prepare('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?').run(quantity, productId);

  return db.prepare(`
    SELECT s.id, s.product_id AS productId, s.quantity, s.sale_date AS saleDate,
           s.unit_price AS unitPrice, s.cost_price AS costPrice, s.revenue, s.profit,
           s.customer_id AS customerId, s.customer_name AS customerName,
           s.created_at AS createdAt,
           p.name AS productName
    FROM sales s
    JOIN products p ON p.id = s.product_id
    WHERE s.id = ?
  `).get(result.lastInsertRowid);
});

function createSale(payload) {
  return createSaleTx(payload);
}

function listSales(filters = {}) {
  const { from, to, productId } = filters;
  const clauses = [];
  const params = [];

  if (from) {
    clauses.push('sale_date >= ?');
    params.push(dayjs(from).toISOString());
  }
  if (to) {
    clauses.push('sale_date <= ?');
    params.push(dayjs(to).endOf('day').toISOString());
  }
  if (productId) {
    clauses.push('product_id = ?');
    params.push(productId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const rows = db.prepare(`
    SELECT s.id, s.product_id AS productId, p.name AS productName,
           s.quantity, s.sale_date AS saleDate,
           s.unit_price AS unitPrice, s.revenue, s.profit,
           s.customer_id AS customerId, s.customer_name AS customerName
    FROM sales s
    JOIN products p ON p.id = s.product_id
    ${where}
    ORDER BY s.sale_date DESC
  `).all(...params);
  return rows;
}

function getRevenueByPeriod(period = 'day') {
  const formatMap = {
    day: '%Y-%m-%d',
    week: '%Y-%W',
    month: '%Y-%m',
  };
  const format = formatMap[period] || formatMap.day;

  return db.prepare(`
    SELECT strftime('${format}', sale_date) AS label,
           SUM(revenue) AS revenue,
           SUM(profit) AS profit,
           SUM(quantity) AS units
    FROM sales
    GROUP BY label
    ORDER BY label DESC
    LIMIT 30
  `).all();
}

function getTopProducts(limit = 5, days = 30) {
  return db.prepare(`
    SELECT p.id, p.name,
           SUM(s.quantity) AS unitsSold,
           SUM(s.revenue) AS revenue
    FROM sales s
    JOIN products p ON p.id = s.product_id
    WHERE s.sale_date >= ?
    GROUP BY p.id, p.name
    ORDER BY unitsSold DESC
    LIMIT ?
  `).all(dayjs().subtract(days, 'day').toISOString(), limit);
}

function getBestSellerThisWeek() {
  const startOfWeek = dayjs().startOf('week');
  return db.prepare(`
    SELECT p.id, p.name, SUM(s.quantity) AS unitsSold
    FROM sales s
    JOIN products p ON p.id = s.product_id
    WHERE s.sale_date >= ?
    GROUP BY p.id, p.name
    ORDER BY unitsSold DESC
    LIMIT 1
  `).get(startOfWeek.toISOString());
}

function getSummary() {
  const totals = db.prepare(`
    SELECT COUNT(DISTINCT product_id) AS productsSold,
           SUM(quantity) AS unitsSold,
           SUM(revenue) AS revenue,
           SUM(profit) AS profit
    FROM sales
  `).get();

  return totals;
}

module.exports = {
  createSale,
  listSales,
  getRevenueByPeriod,
  getTopProducts,
  getBestSellerThisWeek,
  getSummary,
};
