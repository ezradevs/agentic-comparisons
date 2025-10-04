const dayjs = require('dayjs');
const db = require('../db');

function listCustomers() {
  return db.prepare(`
    SELECT id, name, email, phone, created_at AS createdAt
    FROM customers
    ORDER BY name ASC
  `).all();
}

function getCustomerById(id) {
  return db.prepare(`
    SELECT id, name, email, phone, created_at AS createdAt
    FROM customers WHERE id = ?
  `).get(id);
}

function createCustomer(data) {
  const stmt = db.prepare(`
    INSERT INTO customers (name, email, phone)
    VALUES (@name, @email, @phone)
  `);
  const result = stmt.run({
    ...data,
    email: data.email ?? null,
    phone: data.phone ?? null,
  });
  return getCustomerById(result.lastInsertRowid);
}

function updateCustomer(id, data) {
  db.prepare(`
    UPDATE customers
    SET name = @name,
        email = @email,
        phone = @phone
    WHERE id = @id
  `).run({
    id,
    ...data,
    email: data.email ?? null,
    phone: data.phone ?? null,
  });
  return getCustomerById(id);
}

function deleteCustomer(id) {
  db.prepare('DELETE FROM customers WHERE id = ?').run(id);
}

function getPurchaseHistory(customerId) {
  return db.prepare(`
    SELECT s.id, p.name AS productName, s.quantity, s.sale_date AS saleDate,
           s.revenue, s.profit
    FROM sales s
    JOIN products p ON p.id = s.product_id
    WHERE s.customer_id = ?
    ORDER BY s.sale_date DESC
  `).all(customerId);
}

function resolveCustomer({ customerId, customerName }) {
  if (customerId) {
    return { customerId, customerName: null };
  }
  if (!customerName) {
    return { customerId: null, customerName: null };
  }

  const existing = db.prepare('SELECT id FROM customers WHERE name = ?').get(customerName);
  if (existing) {
    return { customerId: existing.id, customerName: null };
  }
  const result = db.prepare('INSERT INTO customers (name, created_at) VALUES (?, ?)').run(
    customerName,
    dayjs().toISOString()
  );
  return { customerId: result.lastInsertRowid, customerName: null };
}

module.exports = {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getPurchaseHistory,
  resolveCustomer,
};
