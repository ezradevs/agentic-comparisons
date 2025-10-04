const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD) || 5,
  dbPath: process.env.DB_PATH || path.resolve(process.cwd(), 'database.sqlite'),
  defaultAdmin: {
    name: process.env.DEFAULT_ADMIN_NAME || 'Owner',
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@smallbiz.local',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'Password123!',
  },
};

module.exports = config;
