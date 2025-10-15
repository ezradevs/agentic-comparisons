import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export const getDatabase = (): Database.Database => {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || './data/chess-club.db';
    const dbDir = path.dirname(dbPath);

    // Ensure data directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    console.log(`Database connected: ${dbPath}`);
  }

  return db;
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
};
