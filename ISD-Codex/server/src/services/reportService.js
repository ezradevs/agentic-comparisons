const dayjs = require('dayjs');
const db = require('../db');

function getDateRange(period) {
  const today = dayjs();
  switch (period) {
    case 'daily':
      return {
        from: today.startOf('day').toISOString(),
        to: today.endOf('day').toISOString(),
      };
    case 'weekly':
      return {
        from: today.startOf('week').toISOString(),
        to: today.endOf('week').toISOString(),
      };
    case 'monthly':
      return {
        from: today.startOf('month').toISOString(),
        to: today.endOf('month').toISOString(),
      };
    default:
      return {};
  }
}

function aggregateSales({ from, to }) {
  const clauses = [];
  const params = [];

  if (from) {
    clauses.push('sale_date >= ?');
    params.push(from);
  }
  if (to) {
    clauses.push('sale_date <= ?');
    params.push(to);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  return db.prepare(`
    SELECT COUNT(*) AS totalSales,
           SUM(quantity) AS unitsSold,
           SUM(revenue) AS revenue,
           SUM(profit) AS profit
    FROM sales
    ${where}
  `).get(...params);
}

function salesReport(period = 'daily') {
  const range = getDateRange(period);
  const totals = aggregateSales(range);

  const breakdown = db.prepare(`
    SELECT p.name AS productName,
           SUM(s.quantity) AS unitsSold,
           SUM(s.revenue) AS revenue,
           SUM(s.profit) AS profit
    FROM sales s
    JOIN products p ON p.id = s.product_id
    ${range.from ? 'WHERE s.sale_date >= ? AND s.sale_date <= ?' : ''}
    GROUP BY p.id
    ORDER BY revenue DESC
  `).all(...(range.from ? [range.from, range.to] : []));

  return { range, totals, breakdown };
}

function inventorySnapshot() {
  return db.prepare(`
    SELECT id, name, sku, stock_quantity AS stockQuantity,
           reorder_level AS reorderLevel,
           sale_price AS salePrice
    FROM products
    ORDER BY stock_quantity ASC
  `).all();
}

module.exports = {
  salesReport,
  inventorySnapshot,
  aggregateSales,
};
