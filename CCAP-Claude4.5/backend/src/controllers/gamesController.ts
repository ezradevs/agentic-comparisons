import { Request, Response } from 'express';
import { getDatabase } from '../database/connection';
import { TournamentEngine, TournamentPlayer, Game } from '../engine';

export const getTournamentGames = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { round } = req.query;

    const db = getDatabase();

    let query = `
      SELECT
        g.*,
        wp.first_name as white_first_name,
        wp.last_name as white_last_name,
        wp.rating as white_rating,
        bp.first_name as black_first_name,
        bp.last_name as black_last_name,
        bp.rating as black_rating
      FROM games g
      LEFT JOIN players wp ON g.white_player_id = wp.id
      LEFT JOIN players bp ON g.black_player_id = bp.id
      WHERE g.tournament_id = ?
    `;

    const params: any[] = [id];

    if (round) {
      query += ' AND g.round = ?';
      params.push(round);
    }

    query += ' ORDER BY g.round, g.board_number';

    const games = db.prepare(query).all(...params);
    res.json({ games });
  } catch (error) {
    console.error('Get tournament games error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGame = (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const db = getDatabase();

    const game = db
      .prepare(
        `SELECT
          g.*,
          wp.first_name as white_first_name,
          wp.last_name as white_last_name,
          wp.rating as white_rating,
          bp.first_name as black_first_name,
          bp.last_name as black_last_name,
          bp.rating as black_rating
        FROM games g
        LEFT JOIN players wp ON g.white_player_id = wp.id
        LEFT JOIN players bp ON g.black_player_id = bp.id
        WHERE g.id = ?`
      )
      .get(gameId);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({ game });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateGameResult = (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { result } = req.body;

    const validResults = ['1-0', '0-1', '1/2-1/2', 'BYE', 'FORFEIT_WHITE', 'FORFEIT_BLACK'];

    if (!result || !validResults.includes(result)) {
      return res.status(400).json({ error: 'Invalid result' });
    }

    const db = getDatabase();

    const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId) as any;

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    db.prepare(
      'UPDATE games SET result = ?, played_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(result, gameId);

    // Update standings
    updateStandings(game.tournament_id);

    const updatedGame = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);

    res.json({ game: updatedGame });
  } catch (error) {
    console.error('Update game result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const clearGameResult = (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const db = getDatabase();

    const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId) as any;

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    db.prepare('UPDATE games SET result = NULL, played_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      gameId
    );

    // Update standings
    updateStandings(game.tournament_id);

    res.json({ message: 'Game result cleared' });
  } catch (error) {
    console.error('Clear game result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to update standings
function updateStandings(tournamentId: number) {
  const db = getDatabase();

  // Get all players in tournament
  const playersData = db
    .prepare(
      `SELECT p.*, tp.initial_rating, tp.withdrew
      FROM players p
      JOIN tournament_players tp ON p.id = tp.player_id
      WHERE tp.tournament_id = ?`
    )
    .all(tournamentId) as any[];

  // Get all games
  const gamesData = db
    .prepare('SELECT * FROM games WHERE tournament_id = ?')
    .all(tournamentId) as Game[];

  // Initialize player stats
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

  const playerMap = new Map(players.map(p => [p.id, p]));

  // Calculate stats from games
  gamesData.forEach(game => {
    if (!game.result) return;

    const whitePlayer = playerMap.get(game.white_player_id!);
    const blackPlayer = game.black_player_id ? playerMap.get(game.black_player_id) : null;

    if (game.result === 'BYE' && whitePlayer) {
      whitePlayer.points += 1;
      whitePlayer.wins += 1;
      whitePlayer.games_played += 1;
    } else if (game.result === '1-0') {
      if (whitePlayer) {
        whitePlayer.points += 1;
        whitePlayer.wins += 1;
        whitePlayer.games_played += 1;
        if (blackPlayer) whitePlayer.opponents.push(blackPlayer.id);
      }
      if (blackPlayer) {
        blackPlayer.losses += 1;
        blackPlayer.games_played += 1;
        if (whitePlayer) blackPlayer.opponents.push(whitePlayer.id);
      }
    } else if (game.result === '0-1') {
      if (blackPlayer) {
        blackPlayer.points += 1;
        blackPlayer.wins += 1;
        blackPlayer.games_played += 1;
        if (whitePlayer) blackPlayer.opponents.push(whitePlayer.id);
      }
      if (whitePlayer) {
        whitePlayer.losses += 1;
        whitePlayer.games_played += 1;
        if (blackPlayer) whitePlayer.opponents.push(blackPlayer.id);
      }
    } else if (game.result === '1/2-1/2') {
      if (whitePlayer) {
        whitePlayer.points += 0.5;
        whitePlayer.draws += 1;
        whitePlayer.games_played += 1;
        if (blackPlayer) whitePlayer.opponents.push(blackPlayer.id);
      }
      if (blackPlayer) {
        blackPlayer.points += 0.5;
        blackPlayer.draws += 1;
        blackPlayer.games_played += 1;
        if (whitePlayer) blackPlayer.opponents.push(whitePlayer.id);
      }
    } else if (game.result === 'FORFEIT_WHITE' && blackPlayer) {
      blackPlayer.points += 1;
      blackPlayer.wins += 1;
      blackPlayer.games_played += 1;
    } else if (game.result === 'FORFEIT_BLACK' && whitePlayer) {
      whitePlayer.points += 1;
      whitePlayer.wins += 1;
      whitePlayer.games_played += 1;
    }
  });

  // Calculate tiebreaks
  TournamentEngine.calculateTiebreaks(players, gamesData);

  // Sort players by points, then tiebreaks
  players.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz;
    if (b.sonneborn_berger !== a.sonneborn_berger)
      return b.sonneborn_berger - a.sonneborn_berger;
    return b.rating - a.rating;
  });

  // Clear old standings
  db.prepare('DELETE FROM standings WHERE tournament_id = ?').run(tournamentId);

  // Insert new standings
  const insertStmt = db.prepare(
    `INSERT INTO standings
    (tournament_id, player_id, points, wins, draws, losses, games_played, buchholz, sonneborn_berger, rank)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  players.forEach((player, index) => {
    insertStmt.run(
      tournamentId,
      player.id,
      player.points,
      player.wins,
      player.draws,
      player.losses,
      player.games_played,
      player.buchholz,
      player.sonneborn_berger,
      index + 1
    );
  });
}
