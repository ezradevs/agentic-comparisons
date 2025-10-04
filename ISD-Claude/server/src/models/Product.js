import db from '../config/database.js';

export class Product {
  static create({ name, category, sku, cost_price, sale_price, stock_quantity, supplier, low_stock_threshold }) {
    const stmt = db.prepare(`
      INSERT INTO products (name, category, sku, cost_price, sale_price, stock_quantity, supplier, low_stock_threshold)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, category, sku, cost_price, sale_price, stock_quantity, supplier || null, low_stock_threshold || 10);
    return result.lastInsertRowid;
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    return stmt.get(id);
  }

  static findBySku(sku) {
    const stmt = db.prepare('SELECT * FROM products WHERE sku = ?');
    return stmt.get(sku);
  }

  static getAll() {
    const stmt = db.prepare('SELECT * FROM products ORDER BY name');
    return stmt.all();
  }

  static getLowStock() {
    const stmt = db.prepare('SELECT * FROM products WHERE stock_quantity <= low_stock_threshold ORDER BY stock_quantity');
    return stmt.all();
  }

  static getByCategory(category) {
    const stmt = db.prepare('SELECT * FROM products WHERE category = ? ORDER BY name');
    return stmt.all(category);
  }

  static update(id, { name, category, sku, cost_price, sale_price, stock_quantity, supplier, low_stock_threshold }) {
    const stmt = db.prepare(`
      UPDATE products
      SET name = ?, category = ?, sku = ?, cost_price = ?, sale_price = ?,
          stock_quantity = ?, supplier = ?, low_stock_threshold = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(name, category, sku, cost_price, sale_price, stock_quantity, supplier, low_stock_threshold, id);
  }

  static updateStock(id, quantity) {
    const stmt = db.prepare('UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(quantity, id);
  }

  static decrementStock(id, quantity) {
    const stmt = db.prepare('UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(quantity, id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    return stmt.run(id);
  }

  static getCategories() {
    const stmt = db.prepare('SELECT DISTINCT category FROM products ORDER BY category');
    return stmt.all();
  }
}
