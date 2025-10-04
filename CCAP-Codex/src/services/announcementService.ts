import { database } from '../db/database';
import { Announcement, AnnouncementPriority } from '../types/domain';
import { createId } from '../utils/id';
import { nowIso } from '../utils/dates';

interface CreateAnnouncementInput {
  title: string;
  body: string;
  priority?: AnnouncementPriority;
  publish_at?: string;
  expires_at?: string;
  created_by?: string;
}

interface UpdateAnnouncementInput extends Partial<CreateAnnouncementInput> {}

const serializeAnnouncement = (row: any): Announcement => ({
  id: row.id,
  title: row.title,
  body: row.body,
  priority: row.priority,
  publish_at: row.publish_at,
  expires_at: row.expires_at,
  created_by: row.created_by,
  created_at: row.created_at
});

export const announcementService = {
  list(activeOnly = false): Announcement[] {
    const where = activeOnly ? `WHERE (expires_at IS NULL OR datetime(expires_at) > datetime('now'))` : '';
    const stmt = database.instance.prepare(`
      SELECT * FROM announcements
      ${where}
      ORDER BY datetime(publish_at) DESC
    `);
    return stmt.all().map(serializeAnnouncement);
  },

  getById(id: string): Announcement | null {
    const stmt = database.instance.prepare('SELECT * FROM announcements WHERE id = ?');
    const row = stmt.get(id);
    return row ? serializeAnnouncement(row) : null;
  },

  create(input: CreateAnnouncementInput): Announcement {
    const id = createId();
    const now = nowIso();
    const stmt = database.instance.prepare(`
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

  update(id: string, input: UpdateAnnouncementInput): Announcement {
    const existing = this.getById(id);
    if (!existing) {
      throw new Error('Announcement not found');
    }

    const stmt = database.instance.prepare(`
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

  remove(id: string) {
    const stmt = database.instance.prepare('DELETE FROM announcements WHERE id = ?');
    stmt.run(id);
  }
};
