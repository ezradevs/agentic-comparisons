import db from '../config/database.js';

export class Sale {
  static create({ product_id, customer_id, quantity, unit_price, created_by, notes }) {
    const total_amount = quantity * unit_price;

    // Get product cost to calculate profit
    const product = db.prepare('SELECT cost_price FROM products WHERE id = ?').get(product_id);
    const profit = (unit_price - product.cost_price) * quantity;

    const stmt = db.prepare(`
      INSERT INTO sales (product_id, customer_id, quantity, unit_price, total_amount, profit, created_by, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(product_id, customer_id || null, quantity, unit_price, total_amount, profit, created_by, notes || null);

    // Update product stock
    db.prepare('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?').run(quantity, product_id);

    return result.lastInsertRowid;
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT s.*, p.name as product_name, p.sku, c.name as customer_name, u.username as created_by_username
      FROM sales s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN customers c ON s.customer_id = c.id
      JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `);
    return stmt.get(id);
  }

  static getAll(limit = 100, offset = 0) {
    const stmt = db.prepare(`
      SELECT s.*, p.name as product_name, p.sku, c.name as customer_name, u.username as created_by_username
      FROM sales s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN customers c ON s.customer_id = c.id
      JOIN users u ON s.created_by = u.id
      ORDER BY s.sale_date DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset);
  }

  static getByDateRange(startDate, endDate) {
    const stmt = db.prepare(`
      SELECT s.*, p.name as product_name, p.sku, c.name as customer_name, u.username as created_by_username
      FROM sales s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN customers c ON s.customer_id = c.id
      JOIN users u ON s.created_by = u.id
      WHERE DATE(s.sale_date) BETWEEN DATE(?) AND DATE(?)
      ORDER BY s.sale_date DESC
    `);
    return stmt.all(startDate, endDate);
  }

  static getByProduct(productId) {
    const stmt = db.prepare(`
      SELECT s.*, c.name as customer_name, u.username as created_by_username
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      JOIN users u ON s.created_by = u.id
      WHERE s.product_id = ?
      ORDER BY s.sale_date DESC
    `);
    return stmt.all(productId);
  }

  static getRevenueByPeriod(period = 'day', limit = 30) {
    let groupBy;
    switch(period) {
      case 'month':
        groupBy = "strftime('%Y-%m', sale_date)";
        break;
      case 'week':
        groupBy = "strftime('%Y-W%W', sale_date)";
        break;
      default:
        groupBy = "DATE(sale_date)";
    }

    const stmt = db.prepare(`
      SELECT ${groupBy} as period,
             SUM(total_amount) as revenue,
             SUM(profit) as profit,
             COUNT(*) as sales_count
      FROM sales
      GROUP BY period
      ORDER BY period DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  static getTopProducts(limit = 10, startDate = null, endDate = null) {
    let query = `
      SELECT p.id, p.name, p.sku, p.category,
             SUM(s.quantity) as total_quantity,
             SUM(s.total_amount) as total_revenue,
             SUM(s.profit) as total_profit,
             COUNT(s.id) as sales_count
      FROM sales s
      JOIN products p ON s.product_id = p.id
    `;

    const params = [limit];
    if (startDate && endDate) {
      query += ' WHERE DATE(s.sale_date) BETWEEN DATE(?) AND DATE(?)';
      params.unshift(startDate, endDate);
    }

    query += `
      GROUP BY p.id
      ORDER BY total_revenue DESC
      LIMIT ?
    `;

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const todayStats = db.prepare(`
      SELECT SUM(total_amount) as revenue, SUM(profit) as profit, COUNT(*) as count
      FROM sales WHERE DATE(sale_date) = DATE(?)
    `).get(today);

    const weekStats = db.prepare(`
      SELECT SUM(total_amount) as revenue, SUM(profit) as profit, COUNT(*) as count
      FROM sales WHERE DATE(sale_date) >= DATE(?)
    `).get(weekAgo);

    const monthStats = db.prepare(`
      SELECT SUM(total_amount) as revenue, SUM(profit) as profit, COUNT(*) as count
      FROM sales WHERE DATE(sale_date) >= DATE(?)
    `).get(monthAgo);

    return {
      today: todayStats,
      week: weekStats,
      month: monthStats
    };
  }

  static delete(id) {
    // Get sale details before deletion to restore stock
    const sale = db.prepare('SELECT product_id, quantity FROM sales WHERE id = ?').get(id);
    if (sale) {
      // Restore stock
      db.prepare('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?').run(sale.quantity, sale.product_id);
    }
    const stmt = db.prepare('DELETE FROM sales WHERE id = ?');
    return stmt.run(id);
  }
}
