import DatabaseConstructor from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

const ensureDirectory = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDirectory(config.databasePath);

const db = new DatabaseConstructor(config.databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

type Transaction<T> = (db: DatabaseConstructor.Database) => T;

export const database = {
  instance: db,
  transaction<T>(fn: Transaction<T>): T {
    const wrapped = db.transaction(fn);
    return wrapped(db);
  }
};

export type SqliteDatabase = DatabaseConstructor.Database;
