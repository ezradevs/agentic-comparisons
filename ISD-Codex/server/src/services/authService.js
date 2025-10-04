const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, config.jwtSecret, {
    expiresIn: '12h',
  });
}

function authenticate(email, password) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    throw new Error('Invalid credentials');
  }
  const token = generateToken(user);
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

function listUsers() {
  return db
    .prepare('SELECT id, name, email, role, created_at AS createdAt FROM users ORDER BY created_at DESC')
    .all();
}

function createUser({ name, email, password, role }) {
  const hash = bcrypt.hashSync(password, 10);
  const stmt = db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(name, email, hash, role);
  return db
    .prepare('SELECT id, name, email, role, created_at AS createdAt FROM users WHERE id = ?')
    .get(result.lastInsertRowid);
}

module.exports = {
  authenticate,
  listUsers,
  createUser,
};
