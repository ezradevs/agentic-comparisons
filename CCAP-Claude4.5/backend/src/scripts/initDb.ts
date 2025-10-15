import dotenv from 'dotenv';
import { getDatabase, closeDatabase } from '../database/connection';
import { initializeDatabase, seedDatabase } from '../database/schema';

dotenv.config();

const initDb = () => {
  try {
    console.log('Initializing database...');
    const db = getDatabase();
    initializeDatabase(db);
    seedDatabase(db);
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
};

initDb();
