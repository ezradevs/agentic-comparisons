import Database from 'better-sqlite3';

export const initializeDatabase = (db: Database.Database) => {
  // Users/Admins table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Players table
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      rating INTEGER DEFAULT 1200,
      fide_id TEXT,
      birth_date DATE,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tournaments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL CHECK(type IN ('swiss', 'round_robin', 'single_elimination', 'double_elimination')),
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
      start_date DATE NOT NULL,
      end_date DATE,
      rounds INTEGER NOT NULL,
      current_round INTEGER DEFAULT 0,
      time_control TEXT,
      location TEXT,
      min_rating INTEGER,
      max_rating INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tournament participants
  db.exec(`
    CREATE TABLE IF NOT EXISTS tournament_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      seed_number INTEGER,
      initial_rating INTEGER,
      withdrew INTEGER DEFAULT 0,
      withdrew_round INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
      UNIQUE(tournament_id, player_id)
    );
  `);

  // Games/Pairings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      round INTEGER NOT NULL,
      white_player_id INTEGER,
      black_player_id INTEGER,
      result TEXT CHECK(result IN ('1-0', '0-1', '1/2-1/2', 'BYE', 'FORFEIT_WHITE', 'FORFEIT_BLACK', NULL)),
      board_number INTEGER,
      played_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (white_player_id) REFERENCES players(id),
      FOREIGN KEY (black_player_id) REFERENCES players(id)
    );
  `);

  // Standings cache table (for performance)
  db.exec(`
    CREATE TABLE IF NOT EXISTS standings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      points REAL DEFAULT 0,
      wins INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      games_played INTEGER DEFAULT 0,
      buchholz REAL DEFAULT 0,
      sonneborn_berger REAL DEFAULT 0,
      performance_rating INTEGER,
      rank INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
      UNIQUE(tournament_id, player_id)
    );
  `);

  // Indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_games_tournament ON games(tournament_id);
    CREATE INDEX IF NOT EXISTS idx_games_round ON games(tournament_id, round);
    CREATE INDEX IF NOT EXISTS idx_tournament_players ON tournament_players(tournament_id);
    CREATE INDEX IF NOT EXISTS idx_standings_tournament ON standings(tournament_id);
    CREATE INDEX IF NOT EXISTS idx_players_rating ON players(rating);
  `);

  console.log('Database schema initialized successfully');
};

export const seedDatabase = (db: Database.Database) => {
  // Check if admin exists
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

  if (adminExists.count === 0) {
    // Create default admin (password: admin123 - should be changed in production)
    const bcrypt = require('bcrypt');
    const passwordHash = bcrypt.hashSync('admin123', 10);

    db.prepare(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', 'admin@chessclub.com', passwordHash, 'admin');

    console.log('Default admin user created: admin / admin123');
  }
};
