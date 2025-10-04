"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../db/database");
const id_1 = require("../utils/id");
const dates_1 = require("../utils/dates");
const serializeUser = (row) => ({
    id: row.id,
    email: row.email,
    password_hash: row.password_hash,
    full_name: row.full_name,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at
});
exports.userService = {
    async create(input) {
        const id = (0, id_1.createId)();
        const email = input.email.toLowerCase();
        const password_hash = await bcryptjs_1.default.hash(input.password, 10);
        const now = (0, dates_1.nowIso)();
        const stmt = database_1.database.instance.prepare(`
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
    getById(id) {
        const stmt = database_1.database.instance.prepare('SELECT * FROM users WHERE id = ?');
        const row = stmt.get(id);
        return row ? serializeUser(row) : null;
    },
    getByEmail(email) {
        const normalized = email.toLowerCase();
        const stmt = database_1.database.instance.prepare('SELECT * FROM users WHERE email = ?');
        const row = stmt.get(normalized);
        return row ? serializeUser(row) : null;
    },
    async verifyPassword(user, password) {
        return bcryptjs_1.default.compare(password, user.password_hash);
    },
    list() {
        const stmt = database_1.database.instance.prepare('SELECT * FROM users ORDER BY full_name');
        const rows = stmt.all();
        return rows.map(serializeUser);
    }
};
