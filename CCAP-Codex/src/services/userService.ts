import bcrypt from 'bcryptjs';
import { database } from '../db/database';
import { createId } from '../utils/id';
import { nowIso } from '../utils/dates';
import { Role, User } from '../types/domain';

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: Role;
}

const serializeUser = (row: any): User => ({
  id: row.id,
  email: row.email,
  password_hash: row.password_hash,
  full_name: row.full_name,
  role: row.role,
  created_at: row.created_at,
  updated_at: row.updated_at
});

export const userService = {
  async create(input: CreateUserInput): Promise<User> {
    const id = createId();
    const email = input.email.toLowerCase();
    const password_hash = await bcrypt.hash(input.password, 10);
    const now = nowIso();
    const stmt = database.instance.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
      VALUES (@id, @email, @password_hash, @full_name, @role, @created_at, @updated_at)
    `);
    stmt.run({ id, email, password_hash, full_name: input.full_name, role: input.role, created_at: now, updated_at: now });
    const user = this.getById(id);
    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  },

  getById(id: string): User | null {
    const stmt = database.instance.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id);
    return row ? serializeUser(row) : null;
  },

  getByEmail(email: string): User | null {
    const normalized = email.toLowerCase();
    const stmt = database.instance.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(normalized);
    return row ? serializeUser(row) : null;
  },

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  },

  list(): User[] {
    const stmt = database.instance.prepare('SELECT * FROM users ORDER BY full_name');
    const rows = stmt.all();
    return rows.map(serializeUser);
  }
};
