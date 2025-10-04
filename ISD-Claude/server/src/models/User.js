import db from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
  static create({ username, email, password, role }) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(username, email, hashedPassword, role);
    return result.lastInsertRowid;
  }

  static findById(id) {
    const stmt = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  }

  static findByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  }

  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  static getAll() {
    const stmt = db.prepare('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
    return stmt.all();
  }

  static update(id, { username, email, role }) {
    const stmt = db.prepare(`
      UPDATE users
      SET username = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(username, email, role, id);
  }

  static updatePassword(id, newPassword) {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const stmt = db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(hashedPassword, id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  }

  static verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
}
