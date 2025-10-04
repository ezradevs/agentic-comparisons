import { database } from '../db/database';
import { createId } from '../utils/id';
import { nowIso } from '../utils/dates';
import {
  Event,
  EventCategory,
  EventStatus,
  EventRegistration,
  RegistrationStatus,
  Match,
  MatchResult
} from '../types/domain';

export interface RegistrationDetail extends EventRegistration {
  member_name: string;
  member_status: string;
  rating: number | null;
}

export interface MatchDetail extends Match {
  white_member_name: string | null;
  black_member_name: string | null;
}

export interface ListEventsOptions {
  status?: EventStatus;
  category?: EventCategory;
  upcomingOnly?: boolean;
  search?: string;
}

export interface CreateEventInput {
  name: string;
  category: EventCategory;
  format: string;
  start_date: string;
  end_date?: string;
  registration_deadline?: string;
  location?: string;
  time_control?: string;
  description?: string;
  status?: EventStatus;
  capacity?: number;
  coordinator_id?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {}

export interface CreateRegistrationInput {
  event_id: string;
  member_id: string;
  status?: RegistrationStatus;
  notes?: string;
}

export interface UpdateRegistrationInput {
  status?: RegistrationStatus;
  score?: number;
  notes?: string;
  check_in_at?: string;
}

export interface CreateMatchInput {
  event_id: string;
  round: number;
  board: number;
  white_member_id?: string;
  black_member_id?: string;
  result?: MatchResult;
  played_at?: string;
  recorded_by?: string;
  notes?: string;
}

export interface UpdateMatchInput extends Partial<Omit<CreateMatchInput, 'event_id'>> {}

const serializeEvent = (row: any): Event => ({
  id: row.id,
  name: row.name,
  category: row.category,
  format: row.format,
  start_date: row.start_date,
  end_date: row.end_date,
  registration_deadline: row.registration_deadline,
  location: row.location,
  time_control: row.time_control,
  description: row.description,
  status: row.status,
  capacity: row.capacity,
  coordinator_id: row.coordinator_id,
  created_at: row.created_at,
  updated_at: row.updated_at
});

const serializeRegistration = (row: any): EventRegistration => ({
  id: row.id,
  event_id: row.event_id,
  member_id: row.member_id,
  status: row.status,
  check_in_at: row.check_in_at,
  score: Number(row.score ?? 0),
  notes: row.notes,
  created_at: row.created_at
});

const serializeMatch = (row: any): Match => ({
  id: row.id,
  event_id: row.event_id,
  round: Number(row.round),
  board: Number(row.board),
  white_member_id: row.white_member_id,
  black_member_id: row.black_member_id,
  result: row.result,
  recorded_by: row.recorded_by,
  played_at: row.played_at,
  notes: row.notes,
  created_at: row.created_at
});

export const eventService = {
  list(options: ListEventsOptions = {}): Event[] {
    const filters: string[] = [];
    const params: any = {};

    if (options.status) {
      filters.push('status = @status');
      params.status = options.status;
    }

    if (options.category) {
      filters.push('category = @category');
      params.category = options.category;
    }

    if (options.upcomingOnly) {
      filters.push(`date(start_date) >= date('now')`);
    }

    if (options.search) {
      filters.push('(name LIKE @search OR description LIKE @search OR location LIKE @search)');
      params.search = `%${options.search}%`;
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const stmt = database.instance.prepare(`
      SELECT * FROM events
      ${where}
      ORDER BY start_date ASC
    `);
    const rows = stmt.all(params);
    return rows.map(serializeEvent);
  },

  getById(id: string): Event | null {
    const stmt = database.instance.prepare('SELECT * FROM events WHERE id = ?');
    const row = stmt.get(id);
    return row ? serializeEvent(row) : null;
  },

  create(input: CreateEventInput): Event {
    const id = createId();
    const now = nowIso();
    const stmt = database.instance.prepare(`
      INSERT INTO events (
        id, name, category, format, start_date, end_date, registration_deadline,
        location, time_control, description, status, capacity, coordinator_id,
        created_at, updated_at
      ) VALUES (
        @id, @name, @category, @format, @start_date, @end_date, @registration_deadline,
        @location, @time_control, @description, @status, @capacity, @coordinator_id,
        @created_at, @updated_at
      )
    `);

    const payload = {
      id,
      name: input.name,
      category: input.category,
      format: input.format,
      start_date: input.start_date,
      end_date: input.end_date ?? null,
      registration_deadline: input.registration_deadline ?? null,
      location: input.location ?? null,
      time_control: input.time_control ?? null,
      description: input.description ?? null,
      status: input.status ?? 'draft',
      capacity: input.capacity ?? null,
      coordinator_id: input.coordinator_id ?? null,
      created_at: now,
      updated_at: now
    };

    stmt.run(payload);
    const event = this.getById(id);
    if (!event) {
      throw new Error('Failed to create event');
    }
    return event;
  },

  update(id: string, input: UpdateEventInput): Event {
    const existing = this.getById(id);
    if (!existing) {
      throw new Error('Event not found');
    }

    const now = nowIso();
    const next = {
      name: input.name ?? existing.name,
      category: input.category ?? existing.category,
      format: input.format ?? existing.format,
      start_date: input.start_date ?? existing.start_date,
      end_date: Object.prototype.hasOwnProperty.call(input, 'end_date') ? input.end_date ?? null : existing.end_date ?? null,
      registration_deadline: Object.prototype.hasOwnProperty.call(input, 'registration_deadline') ? input.registration_deadline ?? null : existing.registration_deadline ?? null,
      location: Object.prototype.hasOwnProperty.call(input, 'location') ? input.location ?? null : existing.location ?? null,
      time_control: Object.prototype.hasOwnProperty.call(input, 'time_control') ? input.time_control ?? null : existing.time_control ?? null,
      description: Object.prototype.hasOwnProperty.call(input, 'description') ? input.description ?? null : existing.description ?? null,
      status: input.status ?? existing.status,
      capacity: Object.prototype.hasOwnProperty.call(input, 'capacity') ? input.capacity ?? null : existing.capacity ?? null,
      coordinator_id: Object.prototype.hasOwnProperty.call(input, 'coordinator_id') ? input.coordinator_id ?? null : existing.coordinator_id ?? null
    };

    const stmt = database.instance.prepare(`
      UPDATE events SET
        name = @name,
        category = @category,
        format = @format,
        start_date = @start_date,
        end_date = @end_date,
        registration_deadline = @registration_deadline,
        location = @location,
        time_control = @time_control,
        description = @description,
        status = @status,
        capacity = @capacity,
        coordinator_id = @coordinator_id,
        updated_at = @updated_at
      WHERE id = @id
    `);

    stmt.run({
      id,
      ...next,
      updated_at: now
    });

    const event = this.getById(id);
    if (!event) {
      throw new Error('Failed to update event');
    }
    return event;
  },

  remove(id: string) {
    const stmt = database.instance.prepare('DELETE FROM events WHERE id = ?');
    stmt.run(id);
  },

  registrationsByEvent(eventId: string): EventRegistration[] {
    const stmt = database.instance.prepare(`
      SELECT * FROM event_registrations WHERE event_id = ? ORDER BY created_at ASC
    `);
    const rows = stmt.all(eventId);
    return rows.map(serializeRegistration);
  },

  registrationDetails(eventId: string): RegistrationDetail[] {
    const stmt = database.instance.prepare(`
      SELECT r.*, m.first_name || ' ' || m.last_name AS member_name,
             m.status AS member_status, m.rating AS rating
      FROM event_registrations r
      INNER JOIN members m ON r.member_id = m.id
      WHERE r.event_id = ?
      ORDER BY datetime(r.created_at) ASC
    `);
    const rows = stmt.all(eventId);
    return rows.map((row: any) => ({
      ...serializeRegistration(row),
      member_name: row.member_name,
      member_status: row.member_status,
      rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : null
    }));
  },

  createRegistration(input: CreateRegistrationInput): EventRegistration {
    const id = createId();
    const now = nowIso();
    const stmt = database.instance.prepare(`
      INSERT INTO event_registrations (
        id, event_id, member_id, status, check_in_at, score, notes, created_at
      ) VALUES (
        @id, @event_id, @member_id, @status, @check_in_at, @score, @notes, @created_at
      )
    `);

    const payload = {
      id,
      event_id: input.event_id,
      member_id: input.member_id,
      status: input.status ?? 'registered',
      check_in_at: null,
      score: 0,
      notes: input.notes ?? null,
      created_at: now
    };

    stmt.run(payload);
    const registration = this.getRegistrationById(id);
    if (!registration) {
      throw new Error('Failed to create registration');
    }
    return registration;
  },

  getRegistrationById(id: string): EventRegistration | null {
    const stmt = database.instance.prepare('SELECT * FROM event_registrations WHERE id = ?');
    const row = stmt.get(id);
    return row ? serializeRegistration(row) : null;
  },

  updateRegistration(id: string, input: UpdateRegistrationInput): EventRegistration {
    const existing = this.getRegistrationById(id);
    if (!existing) {
      throw new Error('Registration not found');
    }

    const stmt = database.instance.prepare(`
      UPDATE event_registrations SET
        status = @status,
        score = @score,
        notes = @notes,
        check_in_at = @check_in_at
      WHERE id = @id
    `);

    stmt.run({
      id,
      status: input.status ?? existing.status,
      score: input.score ?? existing.score,
      notes: Object.prototype.hasOwnProperty.call(input, 'notes') ? input.notes ?? null : existing.notes ?? null,
      check_in_at: input.check_in_at ?? existing.check_in_at ?? null
    });

    const registration = this.getRegistrationById(id);
    if (!registration) {
      throw new Error('Failed to update registration');
    }
    return registration;
  },

  removeRegistration(id: string) {
    const stmt = database.instance.prepare('DELETE FROM event_registrations WHERE id = ?');
    stmt.run(id);
  },

  matchesByEvent(eventId: string): Match[] {
    const stmt = database.instance.prepare(`
      SELECT * FROM matches WHERE event_id = ? ORDER BY round ASC, board ASC
    `);
    const rows = stmt.all(eventId);
    return rows.map(serializeMatch);
  },

  matchDetails(eventId: string): MatchDetail[] {
    const stmt = database.instance.prepare(`
      SELECT m.*,
        (SELECT first_name || ' ' || last_name FROM members WHERE id = m.white_member_id) AS white_name,
        (SELECT first_name || ' ' || last_name FROM members WHERE id = m.black_member_id) AS black_name
      FROM matches m
      WHERE m.event_id = ?
      ORDER BY m.round ASC, m.board ASC
    `);
    const rows = stmt.all(eventId);
    return rows.map((row: any) => ({
      ...serializeMatch(row),
      white_member_name: row.white_name ?? null,
      black_member_name: row.black_name ?? null
    }));
  },

  createMatch(input: CreateMatchInput): Match {
    const id = createId();
    const now = nowIso();
    const stmt = database.instance.prepare(`
      INSERT INTO matches (
        id, event_id, round, board, white_member_id, black_member_id, result,
        recorded_by, played_at, notes, created_at
      ) VALUES (
        @id, @event_id, @round, @board, @white_member_id, @black_member_id, @result,
        @recorded_by, @played_at, @notes, @created_at
      )
    `);

    const payload = {
      id,
      event_id: input.event_id,
      round: input.round,
      board: input.board,
      white_member_id: input.white_member_id ?? null,
      black_member_id: input.black_member_id ?? null,
      result: input.result ?? 'pending',
      recorded_by: input.recorded_by ?? null,
      played_at: input.played_at ?? null,
      notes: input.notes ?? null,
      created_at: now
    };

    stmt.run(payload);
    const match = this.getMatchById(id);
    if (!match) {
      throw new Error('Failed to create match');
    }
    return match;
  },

  getMatchById(id: string): Match | null {
    const stmt = database.instance.prepare('SELECT * FROM matches WHERE id = ?');
    const row = stmt.get(id);
    return row ? serializeMatch(row) : null;
  },

  updateMatch(id: string, input: UpdateMatchInput): Match {
    const existing = this.getMatchById(id);
    if (!existing) {
      throw new Error('Match not found');
    }

    const stmt = database.instance.prepare(`
      UPDATE matches SET
        round = @round,
        board = @board,
        white_member_id = @white_member_id,
        black_member_id = @black_member_id,
        result = @result,
        recorded_by = @recorded_by,
        played_at = @played_at,
        notes = @notes
      WHERE id = @id
    `);

    stmt.run({
      id,
      round: input.round ?? existing.round,
      board: input.board ?? existing.board,
      white_member_id: Object.prototype.hasOwnProperty.call(input, 'white_member_id') ? input.white_member_id ?? null : existing.white_member_id ?? null,
      black_member_id: Object.prototype.hasOwnProperty.call(input, 'black_member_id') ? input.black_member_id ?? null : existing.black_member_id ?? null,
      result: input.result ?? existing.result,
      recorded_by: Object.prototype.hasOwnProperty.call(input, 'recorded_by') ? input.recorded_by ?? null : existing.recorded_by ?? null,
      played_at: Object.prototype.hasOwnProperty.call(input, 'played_at') ? input.played_at ?? null : existing.played_at ?? null,
      notes: Object.prototype.hasOwnProperty.call(input, 'notes') ? input.notes ?? null : existing.notes ?? null
    });

    const match = this.getMatchById(id);
    if (!match) {
      throw new Error('Failed to update match');
    }
    return match;
  },

  removeMatch(id: string) {
    const stmt = database.instance.prepare('DELETE FROM matches WHERE id = ?');
    stmt.run(id);
  },

  standings(eventId: string) {
    const registrations = this.registrationsByEvent(eventId);
    const matches = this.matchesByEvent(eventId);
    const scores = new Map<string, {
      points: number;
      wins: number;
      draws: number;
      losses: number;
      forfeits: number;
      matches: number;
    }>();

    for (const registration of registrations) {
      scores.set(registration.member_id, {
        points: registration.score ?? 0,
        wins: 0,
        draws: 0,
        losses: 0,
        forfeits: 0,
        matches: 0
      });
    }

    const ensureEntry = (memberId?: string | null) => {
      if (!memberId) return null;
      if (!scores.has(memberId)) {
        scores.set(memberId, { points: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, matches: 0 });
      }
      return scores.get(memberId)!;
    };

    for (const match of matches) {
      const white = ensureEntry(match.white_member_id);
      const black = ensureEntry(match.black_member_id);

      if (!white && !black) {
        continue;
      }

      if (match.result === 'pending') {
        continue;
      }

      if (white) {
        white.matches += 1;
      }
      if (black) {
        black.matches += 1;
      }

      switch (match.result) {
        case 'white':
          if (white) {
            white.points += 1;
            white.wins += 1;
          }
          if (black) {
            black.losses += 1;
          }
          break;
        case 'black':
          if (black) {
            black.points += 1;
            black.wins += 1;
          }
          if (white) {
            white.losses += 1;
          }
          break;
        case 'draw':
          if (white) {
            white.points += 0.5;
            white.draws += 1;
          }
          if (black) {
            black.points += 0.5;
            black.draws += 1;
          }
          break;
        case 'forfeit':
          if (white) {
            white.forfeits += 1;
          }
          if (black) {
            black.forfeits += 1;
          }
          break;
      }
    }

    const standings = Array.from(scores.entries()).map(([member_id, stats]) => ({
      member_id,
      ...stats
    }));

    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.member_id.localeCompare(b.member_id);
    });

    return standings;
  }
};
