import db from '../config/database.js';

export class Customer {
  static create({ name, email, phone, address }) {
    const stmt = db.prepare(`
      INSERT INTO customers (name, email, phone, address)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(name, email || null, phone || null, address || null);
    return result.lastInsertRowid;
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM customers WHERE id = ?');
    return stmt.get(id);
  }

  static getAll() {
    const stmt = db.prepare('SELECT * FROM customers ORDER BY name');
    return stmt.all();
  }

  static update(id, { name, email, phone, address }) {
    const stmt = db.prepare(`
      UPDATE customers
      SET name = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(name, email, phone, address, id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
    return stmt.run(id);
  }

  static getPurchaseHistory(id) {
    const stmt = db.prepare(`
      SELECT s.*, p.name as product_name, p.sku
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE s.customer_id = ?
      ORDER BY s.sale_date DESC
    `);
    return stmt.all(id);
  }

  static getCustomerStats(id) {
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total_purchases,
        SUM(total_amount) as total_spent,
        MAX(sale_date) as last_purchase_date
      FROM sales
      WHERE customer_id = ?
    `);
    return stmt.get(id);
  }
}
