"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Unexpected error';
    const status = message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ error: message });
};
exports.errorHandler = errorHandler;
