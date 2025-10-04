const db = require('../db');
const config = require('../config');

function listProducts() {
  const stmt = db.prepare(`
    SELECT id, name, category, sku, cost_price AS costPrice, sale_price AS salePrice,
           stock_quantity AS stockQuantity, supplier, reorder_level AS reorderLevel,
           created_at AS createdAt, updated_at AS updatedAt
    FROM products
    ORDER BY name ASC
  `);
  return stmt.all();
}

function getProductById(id) {
  return db.prepare(`
    SELECT id, name, category, sku, cost_price AS costPrice, sale_price AS salePrice,
           stock_quantity AS stockQuantity, supplier, reorder_level AS reorderLevel,
           created_at AS createdAt, updated_at AS updatedAt
    FROM products WHERE id = ?
  `).get(id);
}

function findProductBySku(sku) {
  return db.prepare('SELECT id FROM products WHERE sku = ?').get(sku);
}

function createProduct(data) {
  const stmt = db.prepare(`
    INSERT INTO products
      (name, category, sku, cost_price, sale_price, stock_quantity, supplier, reorder_level)
    VALUES
      (@name, @category, @sku, @costPrice, @salePrice, @stockQuantity, @supplier, @reorderLevel)
  `);
  const result = stmt.run({
    ...data,
    reorderLevel: data.reorderLevel ?? config.lowStockThreshold,
    category: data.category ?? null,
    supplier: data.supplier ?? null,
  });
  return getProductById(result.lastInsertRowid);
}

function updateProduct(id, data) {
  const stmt = db.prepare(`
    UPDATE products
    SET name = @name,
        category = @category,
        sku = @sku,
        cost_price = @costPrice,
        sale_price = @salePrice,
        stock_quantity = @stockQuantity,
        supplier = @supplier,
        reorder_level = @reorderLevel
    WHERE id = @id
  `);
  stmt.run({
    id,
    ...data,
    reorderLevel: data.reorderLevel ?? config.lowStockThreshold,
    category: data.category ?? null,
    supplier: data.supplier ?? null,
  });
  return getProductById(id);
}

function deleteProduct(id) {
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  stmt.run(id);
}

function adjustStock(productId, delta) {
  const stmt = db.prepare('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?');
  stmt.run(delta, productId);
}

function getLowStockProducts(threshold = config.lowStockThreshold) {
  return db.prepare(`
    SELECT id, name, sku, stock_quantity AS stockQuantity, reorder_level AS reorderLevel
    FROM products
    WHERE stock_quantity <= reorder_level OR stock_quantity <= ?
    ORDER BY stock_quantity ASC
  `).all(threshold);
}

module.exports = {
  listProducts,
  getProductById,
  findProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getLowStockProducts,
};
