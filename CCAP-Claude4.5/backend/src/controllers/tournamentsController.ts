import { Request, Response } from 'express';
import { getDatabase } from '../database/connection';
import { TournamentEngine, TournamentPlayer, Game } from '../engine';

export const getAllTournaments = (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { status } = req.query;

    let query = 'SELECT * FROM tournaments';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY start_date DESC';

    const tournaments = db.prepare(query).all(...params);
    res.json({ tournaments });
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTournament = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const tournament = db
      .prepare('SELECT * FROM tournaments WHERE id = ?')
      .get(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Get player count
    const playerCount = db
      .prepare(
        'SELECT COUNT(*) as count FROM tournament_players WHERE tournament_id = ? AND withdrew = 0'
      )
      .get(id) as any;

    res.json({
      tournament: {
        ...tournament,
        player_count: playerCount.count
      }
    });
  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTournament = (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      type,
      start_date,
      end_date,
      rounds,
      time_control,
      location,
      min_rating,
      max_rating
    } = req.body;

    if (!name || !type || !start_date) {
      return res.status(400).json({
        error: 'Name, type, and start date required'
      });
    }

    const validTypes = ['swiss', 'round_robin', 'single_elimination', 'double_elimination'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid tournament type' });
    }

    const db = getDatabase();
    const result = db
      .prepare(
        `INSERT INTO tournaments
        (name, description, type, start_date, end_date, rounds, time_control, location, min_rating, max_rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        name,
        description || null,
        type,
        start_date,
        end_date || null,
        rounds || 0,
        time_control || null,
        location || null,
        min_rating || null,
        max_rating || null
      );

    const tournament = db
      .prepare('SELECT * FROM tournaments WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json({ tournament });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTournament = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const db = getDatabase();
    const tournament = db
      .prepare('SELECT * FROM tournaments WHERE id = ?')
      .get(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const allowedFields = [
      'name',
      'description',
      'type',
      'status',
      'start_date',
      'end_date',
      'rounds',
      'time_control',
      'location',
      'min_rating',
      'max_rating'
    ];

    const setClauses = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (setClauses.length > 0) {
      values.push(id);
      db.prepare(
        `UPDATE tournaments SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      ).run(...values);
    }

    const updatedTournament = db
      .prepare('SELECT * FROM tournaments WHERE id = ?')
      .get(id);

    res.json({ tournament: updatedTournament });
  } catch (error) {
    console.error('Update tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTournament = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const tournament = db
      .prepare('SELECT * FROM tournaments WHERE id = ?')
      .get(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    db.prepare('DELETE FROM tournaments WHERE id = ?').run(id);
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Delete tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addPlayerToTournament = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { player_id, seed_number } = req.body;

    if (!player_id) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    const db = getDatabase();

    // Check tournament exists
    const tournament = db
      .prepare('SELECT * FROM tournaments WHERE id = ?')
      .get(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check player exists
    const player = db
      .prepare('SELECT * FROM players WHERE id = ?')
      .get(player_id) as any;

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Add player to tournament
    try {
      db.prepare(
        `INSERT INTO tournament_players
        (tournament_id, player_id, seed_number, initial_rating)
        VALUES (?, ?, ?, ?)`
      ).run(id, player_id, seed_number || null, player.rating);

      res.status(201).json({ message: 'Player added to tournament' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint')) {
        return res.status(400).json({ error: 'Player already in tournament' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Add player to tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removePlayerFromTournament = (req: Request, res: Response) => {
  try {
    const { id, playerId } = req.params;
    const db = getDatabase();

    db.prepare(
      'DELETE FROM tournament_players WHERE tournament_id = ? AND player_id = ?'
    ).run(id, playerId);

    res.json({ message: 'Player removed from tournament' });
  } catch (error) {
    console.error('Remove player from tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTournamentPlayers = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const players = db
      .prepare(
        `SELECT p.*, tp.seed_number, tp.initial_rating, tp.withdrew, tp.withdrew_round
        FROM players p
        JOIN tournament_players tp ON p.id = tp.player_id
        WHERE tp.tournament_id = ?
        ORDER BY tp.seed_number, p.last_name, p.first_name`
      )
      .all(id);

    res.json({ players });
  } catch (error) {
    console.error('Get tournament players error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const startNextRound = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const tournament = db
      .prepare('SELECT * FROM tournaments WHERE id = ?')
      .get(id) as any;

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.status !== 'ongoing' && tournament.status !== 'upcoming') {
      return res.status(400).json({ error: 'Tournament is not active' });
    }

    const nextRound = tournament.current_round + 1;

    if (nextRound > tournament.rounds) {
      return res.status(400).json({ error: 'All rounds completed' });
    }

    // Get tournament players
    const playersData = db
      .prepare(
        `SELECT p.*, tp.withdrew, tp.initial_rating
        FROM players p
        JOIN tournament_players tp ON p.id = tp.player_id
        WHERE tp.tournament_id = ?`
      )
      .all(id) as any[];

    // Get previous games
    const previousGames = db
      .prepare('SELECT * FROM games WHERE tournament_id = ?')
      .all(id) as Game[];

    // Calculate standings
    const players: TournamentPlayer[] = playersData.map(p => ({
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      rating: p.initial_rating || p.rating,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      games_played: 0,
      buchholz: 0,
      sonneborn_berger: 0,
      opponents: [],
      colors: [],
      withdrew: p.withdrew === 1
    }));

    // Calculate current standings
    previousGames.forEach(game => {
      if (!game.result) return;

      const whitePlayer = players.find(p => p.id === game.white_player_id);
      const blackPlayer = players.find(p => p.id === game.black_player_id);

      if (game.result === 'BYE' && whitePlayer) {
        whitePlayer.points += 1;
        whitePlayer.wins += 1;
        whitePlayer.games_played += 1;
      } else if (game.result === '1-0') {
        if (whitePlayer) {
          whitePlayer.points += 1;
          whitePlayer.wins += 1;
          whitePlayer.games_played += 1;
        }
        if (blackPlayer) {
          blackPlayer.losses += 1;
          blackPlayer.games_played += 1;
        }
      } else if (game.result === '0-1') {
        if (blackPlayer) {
          blackPlayer.points += 1;
          blackPlayer.wins += 1;
          blackPlayer.games_played += 1;
        }
        if (whitePlayer) {
          whitePlayer.losses += 1;
          whitePlayer.games_played += 1;
        }
      } else if (game.result === '1/2-1/2') {
        if (whitePlayer) {
          whitePlayer.points += 0.5;
          whitePlayer.draws += 1;
          whitePlayer.games_played += 1;
        }
        if (blackPlayer) {
          blackPlayer.points += 0.5;
          blackPlayer.draws += 1;
          blackPlayer.games_played += 1;
        }
      }
    });

    // Generate pairings for next round
    const pairings = TournamentEngine.generatePairings(
      tournament.type,
      players,
      nextRound,
      previousGames
    );

    // Insert pairings into database
    const insertStmt = db.prepare(
      `INSERT INTO games (tournament_id, round, white_player_id, black_player_id, board_number)
      VALUES (?, ?, ?, ?, ?)`
    );

    const insertMany = db.transaction((pairings: any[]) => {
      for (const pairing of pairings) {
        insertStmt.run(
          id,
          nextRound,
          pairing.white_player_id,
          pairing.black_player_id,
          pairing.board_number
        );
      }
    });

    insertMany(pairings);

    // Update tournament
    db.prepare(
      'UPDATE tournaments SET current_round = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(nextRound, 'ongoing', id);

    res.json({
      message: `Round ${nextRound} started`,
      round: nextRound,
      pairings
    });
  } catch (error) {
    console.error('Start next round error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
