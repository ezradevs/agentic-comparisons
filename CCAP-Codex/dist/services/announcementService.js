"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementService = void 0;
const database_1 = require("../db/database");
const id_1 = require("../utils/id");
const dates_1 = require("../utils/dates");
const serializeAnnouncement = (row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    priority: row.priority,
    publish_at: row.publish_at,
    expires_at: row.expires_at,
    created_by: row.created_by,
    created_at: row.created_at
});
exports.announcementService = {
    list(activeOnly = false) {
        const where = activeOnly ? `WHERE (expires_at IS NULL OR datetime(expires_at) > datetime('now'))` : '';
        const stmt = database_1.database.instance.prepare(`
      SELECT * FROM announcements
      ${where}
      ORDER BY datetime(publish_at) DESC
    `);
        return stmt.all().map(serializeAnnouncement);
    },
    getById(id) {
        const stmt = database_1.database.instance.prepare('SELECT * FROM announcements WHERE id = ?');
        const row = stmt.get(id);
        return row ? serializeAnnouncement(row) : null;
    },
    create(input) {
        const id = (0, id_1.createId)();
        const now = (0, dates_1.nowIso)();
        const stmt = database_1.database.instance.prepare(`
      INSERT INTO announcements (
        id, title, body, priority, publish_at, expires_at, created_by, created_at
      ) VALUES (
        @id, @title, @body, @priority, @publish_at, @expires_at, @created_by, @created_at
      )
    `);
        const payload = {
            id,
            title: input.title,
            body: input.body,
            priority: input.priority ?? 'normal',
            publish_at: input.publish_at ?? now,
            expires_at: input.expires_at ?? null,
            created_by: input.created_by ?? null,
            created_at: now
        };
        stmt.run(payload);
        const announcement = this.getById(id);
        if (!announcement) {
            throw new Error('Failed to create announcement');
        }
        return announcement;
    },
    update(id, input) {
        const existing = this.getById(id);
        if (!existing) {
            throw new Error('Announcement not found');
        }
        const stmt = database_1.database.instance.prepare(`
      UPDATE announcements SET
        title = @title,
        body = @body,
        priority = @priority,
        publish_at = @publish_at,
        expires_at = @expires_at,
        created_by = @created_by
      WHERE id = @id
    `);
        stmt.run({
            id,
            title: input.title ?? existing.title,
            body: input.body ?? existing.body,
            priority: input.priority ?? existing.priority,
            publish_at: input.publish_at ?? existing.publish_at,
            expires_at: Object.prototype.hasOwnProperty.call(input, 'expires_at') ? input.expires_at ?? null : existing.expires_at ?? null,
            created_by: Object.prototype.hasOwnProperty.call(input, 'created_by') ? input.created_by ?? null : existing.created_by ?? null
        });
        const announcement = this.getById(id);
        if (!announcement) {
            throw new Error('Failed to update announcement');
        }
        return announcement;
    },
    remove(id) {
        const stmt = database_1.database.instance.prepare('DELETE FROM announcements WHERE id = ?');
        stmt.run(id);
    }
};
