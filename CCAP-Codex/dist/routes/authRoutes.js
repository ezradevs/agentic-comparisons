"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../services/authService");
const schemas_1 = require("../types/schemas");
const http_1 = require("../utils/http");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/login', async (req, res, next) => {
    try {
        const credentials = (0, http_1.parse)(schemas_1.loginSchema, req.body);
        const result = await authService_1.authService.login(credentials.email, credentials.password);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.get('/profile', authMiddleware_1.authenticate, (req, res) => {
    res.json({ user: req.user });
});
exports.default = router;
