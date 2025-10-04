"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const ensureDirectory = (filePath) => {
    const dir = path_1.default.dirname(filePath);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
ensureDirectory(config_1.config.databasePath);
const db = new better_sqlite3_1.default(config_1.config.databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
exports.database = {
    instance: db,
    transaction(fn) {
        const wrapped = db.transaction(fn);
        return wrapped(db);
    }
};
