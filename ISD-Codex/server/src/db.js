const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');
const config = require('./config');

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'staff', 'viewer')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  sku TEXT NOT NULL UNIQUE,
  cost_price REAL NOT NULL,
  sale_price REAL NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  supplier TEXT,
  reorder_level INTEGER NOT NULL DEFAULT 5,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS trg_products_updated_at
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  sale_date TEXT NOT NULL,
  unit_price REAL NOT NULL,
  cost_price REAL NOT NULL,
  revenue REAL NOT NULL,
  profit REAL NOT NULL,
  customer_id INTEGER,
  customer_name TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
`);

function seedAdminUser() {
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin');
  if (adminExists) {
    return;
  }

  const passwordHash = bcrypt.hashSync(config.defaultAdmin.password, 10);
  db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  ).run(config.defaultAdmin.name, config.defaultAdmin.email, passwordHash, 'admin');
  console.log(`Seeded default admin user: ${config.defaultAdmin.email}`);
}

function resetDemoData() {
  const today = dayjs().startOf('day');
  const products = [
    {
      name: 'Wireless Mouse',
      category: 'Electronics',
      sku: 'WM-001',
      cost_price: 12.5,
      sale_price: 25,
      stock_quantity: 40,
      supplier: 'Tech Supplies Co.',
      reorder_level: 10,
    },
    {
      name: 'Notebook',
      category: 'Stationery',
      sku: 'NB-010',
      cost_price: 1.5,
      sale_price: 4.5,
      stock_quantity: 200,
      supplier: 'Paper Goods LLC',
      reorder_level: 50,
    },
    {
      name: 'Desk Lamp',
      category: 'Office',
      sku: 'DL-007',
      cost_price: 18,
      sale_price: 39.99,
      stock_quantity: 15,
      supplier: 'Bright Lights Inc.',
      reorder_level: 5,
    },
  ];

  const hasProducts = db.prepare('SELECT COUNT(1) as count FROM products').get().count > 0;
  if (!hasProducts) {
    const insertProduct = db.prepare(`
      INSERT INTO products
      (name, category, sku, cost_price, sale_price, stock_quantity, supplier, reorder_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const saleInsert = db.prepare(`
      INSERT INTO sales
      (product_id, quantity, sale_date, unit_price, cost_price, revenue, profit, customer_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      for (const product of products) {
        const result = insertProduct.run(
          product.name,
          product.category,
          product.sku,
          product.cost_price,
          product.sale_price,
          product.stock_quantity,
          product.supplier,
          product.reorder_level
        );

        for (let i = 0; i < 10; i += 1) {
          const saleDate = today.subtract(i, 'day');
          const quantity = Math.max(1, Math.round(Math.random() * 5));
          const revenue = product.sale_price * quantity;
          const profit = (product.sale_price - product.cost_price) * quantity;
          saleInsert.run(
            result.lastInsertRowid,
            quantity,
            saleDate.toISOString(),
            product.sale_price,
            product.cost_price,
            revenue,
            profit,
            'Walk-in Customer'
          );
        }
      }
    });

    transaction();
  }
}

seedAdminUser();
resetDemoData();

module.exports = db;
