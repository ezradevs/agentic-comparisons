"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const memberRoutes_1 = __importDefault(require("./routes/memberRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const announcementRoutes_1 = __importDefault(require("./routes/announcementRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const migrations_1 = require("./db/migrations");
const createApp = () => {
    (0, migrations_1.runMigrations)();
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json({ limit: '1mb' }));
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok' });
    });
    app.use('/api/auth', authRoutes_1.default);
    app.use('/api/members', memberRoutes_1.default);
    app.use('/api/events', eventRoutes_1.default);
    app.use('/api/announcements', announcementRoutes_1.default);
    app.use('/api/dashboard', dashboardRoutes_1.default);
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
