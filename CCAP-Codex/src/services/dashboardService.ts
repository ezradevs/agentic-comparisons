import { database } from '../db/database';

interface DashboardMetrics {
  totals: {
    members: number;
    activeMembers: number;
    newThisMonth: number;
    averageRating: number | null;
  };
  upcomingEvents: Array<{
    id: string;
    name: string;
    start_date: string;
    status: string;
    registrations: number;
  }>;
  standingsPreview: Array<{
    event_id: string;
    event_name: string;
    total_matches: number;
    completed_matches: number;
  }>;
  recentActivity: {
    latestMembers: Array<{
      id: string;
      name: string;
      join_date: string | null;
      status: string;
    }>;
    latestMatches: Array<{
      id: string;
      event_name: string;
      round: number;
      result: string;
      played_at: string | null;
    }>;
  };
}

export const dashboardService = {
  getMetrics(): DashboardMetrics {
    const totalsRow = database.instance
      .prepare(`
        SELECT
          (SELECT COUNT(*) FROM members) AS members,
          (SELECT COUNT(*) FROM members WHERE status = 'active') AS active_members,
          (SELECT COUNT(*) FROM members WHERE join_date IS NOT NULL AND date(join_date) >= date('now', '-30 day')) AS new_this_month,
          (SELECT AVG(rating) FROM members WHERE rating IS NOT NULL) AS avg_rating
      `)
      .get() as
      | {
          members: number;
          active_members: number;
          new_this_month: number;
          avg_rating: number | null;
        }
      | undefined;

    const upcomingEvents = database.instance
      .prepare(`
        SELECT e.id, e.name, e.start_date, e.status,
          (SELECT COUNT(*) FROM event_registrations r WHERE r.event_id = e.id) AS registrations
        FROM events e
        WHERE date(e.start_date) >= date('now')
        ORDER BY date(e.start_date) ASC
        LIMIT 5
      `)
      .all();

    const standingsPreview = database.instance
      .prepare(`
        SELECT
          e.id AS event_id,
          e.name AS event_name,
          (SELECT COUNT(*) FROM matches m WHERE m.event_id = e.id) AS total_matches,
          (SELECT COUNT(*) FROM matches m WHERE m.event_id = e.id AND m.result != 'pending') AS completed_matches
        FROM events e
        WHERE e.status IN ('published', 'completed')
        ORDER BY datetime(e.start_date) DESC
        LIMIT 5
      `)
      .all();

    const latestMembers = database.instance
      .prepare(`
        SELECT id, first_name || ' ' || last_name AS name, join_date, status
        FROM members
        ORDER BY datetime(created_at) DESC
        LIMIT 6
      `)
      .all();

    const latestMatches = database.instance
      .prepare(`
        SELECT m.id, e.name AS event_name, m.round, m.result, m.played_at
        FROM matches m
        INNER JOIN events e ON m.event_id = e.id
        WHERE m.result != 'pending'
        ORDER BY datetime(COALESCE(m.played_at, m.created_at)) DESC
        LIMIT 6
      `)
      .all();

    return {
      totals: {
        members: Number(totalsRow?.members ?? 0),
        activeMembers: Number(totalsRow?.active_members ?? 0),
        newThisMonth: Number(totalsRow?.new_this_month ?? 0),
        averageRating: totalsRow?.avg_rating ? Number(totalsRow.avg_rating) : null
      },
      upcomingEvents: upcomingEvents.map((row: any) => ({
        id: row.id,
        name: row.name,
        start_date: row.start_date,
        status: row.status,
        registrations: Number(row.registrations ?? 0)
      })),
      standingsPreview: standingsPreview.map((row: any) => ({
        event_id: row.event_id,
        event_name: row.event_name,
        total_matches: Number(row.total_matches ?? 0),
        completed_matches: Number(row.completed_matches ?? 0)
      })),
      recentActivity: {
        latestMembers: latestMembers.map((row: any) => ({
          id: row.id,
          name: row.name,
          join_date: row.join_date,
          status: row.status
        })),
        latestMatches: latestMatches.map((row: any) => ({
          id: row.id,
          event_name: row.event_name,
          round: Number(row.round),
          result: row.result,
          played_at: row.played_at
        }))
      }
    };
  }
};
