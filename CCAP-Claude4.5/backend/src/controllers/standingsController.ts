import { Request, Response } from 'express';
import { getDatabase } from '../database/connection';

export const getTournamentStandings = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const standings = db
      .prepare(
        `SELECT
          s.*,
          p.first_name,
          p.last_name,
          p.rating,
          tp.initial_rating
        FROM standings s
        JOIN players p ON s.player_id = p.id
        JOIN tournament_players tp ON tp.player_id = p.id AND tp.tournament_id = s.tournament_id
        WHERE s.tournament_id = ?
        ORDER BY s.rank`
      )
      .all(id);

    res.json({ standings });
  } catch (error) {
    console.error('Get tournament standings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPlayerTournamentHistory = (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const db = getDatabase();

    const history = db
      .prepare(
        `SELECT
          t.id as tournament_id,
          t.name as tournament_name,
          t.type as tournament_type,
          t.start_date,
          s.points,
          s.wins,
          s.draws,
          s.losses,
          s.games_played,
          s.rank
        FROM tournament_players tp
        JOIN tournaments t ON tp.tournament_id = t.id
        LEFT JOIN standings s ON s.tournament_id = t.id AND s.player_id = tp.player_id
        WHERE tp.player_id = ?
        ORDER BY t.start_date DESC`
      )
      .all(playerId);

    res.json({ history });
  } catch (error) {
    console.error('Get player tournament history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
