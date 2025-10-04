"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const dashboardService_1 = require("../services/dashboardService");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.get('/metrics', (_req, res) => {
    const metrics = dashboardService_1.dashboardService.getMetrics();
    res.json({ metrics });
});
exports.default = router;
