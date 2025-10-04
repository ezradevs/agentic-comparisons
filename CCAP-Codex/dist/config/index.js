"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), envFile) });
dotenv_1.default.config();
const required = (name, fallback) => {
    const value = process.env[name] ?? fallback;
    if (!value) {
        throw new Error(`Missing required environment variable ${name}`);
    }
    return value;
};
exports.config = {
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
    jwtSecret: required('JWT_SECRET', 'change-me-dev-secret'),
    tokenExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
    databasePath: path_1.default.resolve(process.env.DB_PATH ?? './data/chess-club.db')
};
