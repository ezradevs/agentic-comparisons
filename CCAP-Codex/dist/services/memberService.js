"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberService = void 0;
const database_1 = require("../db/database");
const id_1 = require("../utils/id");
const dates_1 = require("../utils/dates");
const serializeMember = (row) => ({
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    preferred_name: row.preferred_name,
    rating: row.rating,
    email: row.email,
    phone: row.phone,
    uscf_id: row.uscf_id,
    status: row.status,
    join_date: row.join_date,
    membership_expires_on: row.membership_expires_on,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at
});
exports.memberService = {
    list(options = {}) {
        const filters = [];
        const params = {};
        if (options.status) {
            filters.push('status = @status');
            params.status = options.status;
        }
        if (options.search) {
            filters.push('(first_name LIKE @search OR last_name LIKE @search OR preferred_name LIKE @search OR email LIKE @search)');
            params.search = `%${options.search}%`;
        }
        const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
        const stmt = database_1.database.instance.prepare(`SELECT * FROM members ${where} ORDER BY last_name, first_name`);
        const rows = stmt.all(params);
        return rows.map(serializeMember);
    },
    getById(id) {
        const stmt = database_1.database.instance.prepare('SELECT * FROM members WHERE id = ?');
        const row = stmt.get(id);
        return row ? serializeMember(row) : null;
    },
    create(input) {
        const id = (0, id_1.createId)();
        const now = (0, dates_1.nowIso)();
        const stmt = database_1.database.instance.prepare(`
      INSERT INTO members (
        id, first_name, last_name, preferred_name, rating, email, phone, uscf_id,
        status, join_date, membership_expires_on, notes, created_at, updated_at
      ) VALUES (
        @id, @first_name, @last_name, @preferred_name, @rating, @email, @phone, @uscf_id,
        @status, @join_date, @membership_expires_on, @notes, @created_at, @updated_at
      )
    `);
        const payload = {
            id,
            first_name: input.first_name,
            last_name: input.last_name,
            preferred_name: input.preferred_name ?? null,
            rating: input.rating ?? null,
            email: input.email ?? null,
            phone: input.phone ?? null,
            uscf_id: input.uscf_id ?? null,
            status: input.status ?? 'active',
            join_date: input.join_date ?? null,
            membership_expires_on: input.membership_expires_on ?? null,
            notes: input.notes ?? null,
            created_at: now,
            updated_at: now
        };
        stmt.run(payload);
        const member = this.getById(id);
        if (!member) {
            throw new Error('Failed to create member');
        }
        return member;
    },
    update(id, input) {
        const existing = this.getById(id);
        if (!existing) {
            throw new Error('Member not found');
        }
        const now = (0, dates_1.nowIso)();
        const next = {
            first_name: input.first_name ?? existing.first_name,
            last_name: input.last_name ?? existing.last_name,
            preferred_name: Object.prototype.hasOwnProperty.call(input, 'preferred_name')
                ? input.preferred_name ?? null
                : existing.preferred_name ?? null,
            rating: Object.prototype.hasOwnProperty.call(input, 'rating')
                ? input.rating ?? null
                : existing.rating ?? null,
            email: Object.prototype.hasOwnProperty.call(input, 'email')
                ? input.email ?? null
                : existing.email ?? null,
            phone: Object.prototype.hasOwnProperty.call(input, 'phone')
                ? input.phone ?? null
                : existing.phone ?? null,
            uscf_id: Object.prototype.hasOwnProperty.call(input, 'uscf_id')
                ? input.uscf_id ?? null
                : existing.uscf_id ?? null,
            status: input.status ?? existing.status,
            join_date: Object.prototype.hasOwnProperty.call(input, 'join_date')
                ? input.join_date ?? null
                : existing.join_date ?? null,
            membership_expires_on: Object.prototype.hasOwnProperty.call(input, 'membership_expires_on')
                ? input.membership_expires_on ?? null
                : existing.membership_expires_on ?? null,
            notes: Object.prototype.hasOwnProperty.call(input, 'notes')
                ? input.notes ?? null
                : existing.notes ?? null
        };
        const stmt = database_1.database.instance.prepare(`
      UPDATE members SET
        first_name = @first_name,
        last_name = @last_name,
        preferred_name = @preferred_name,
        rating = @rating,
        email = @email,
        phone = @phone,
        uscf_id = @uscf_id,
        status = @status,
        join_date = @join_date,
        membership_expires_on = @membership_expires_on,
        notes = @notes,
        updated_at = @updated_at
      WHERE id = @id
    `);
        stmt.run({
            id,
            ...next,
            updated_at: now
        });
        const member = this.getById(id);
        if (!member) {
            throw new Error('Failed to update member');
        }
        return member;
    },
    remove(id) {
        const stmt = database_1.database.instance.prepare('DELETE FROM members WHERE id = ?');
        stmt.run(id);
    },
    countByStatus() {
        const stmt = database_1.database.instance.prepare(`
      SELECT status, COUNT(*) as total
      FROM members
      GROUP BY status
    `);
        const rows = stmt.all();
        return rows.map((row) => ({ status: row.status, total: Number(row.total) }));
    }
};
