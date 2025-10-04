"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const announcementService_1 = require("../services/announcementService");
const schemas_1 = require("../types/schemas");
const http_1 = require("../utils/http");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.get('/', (req, res) => {
    const { activeOnly } = req.query;
    const announcements = announcementService_1.announcementService.list(activeOnly === 'true');
    res.json({ announcements });
});
router.post('/', (req, res, next) => {
    try {
        const payload = (0, http_1.parse)(schemas_1.announcementCreateSchema, req.body);
        const announcement = announcementService_1.announcementService.create({ ...payload, created_by: req.user?.id });
        res.status(201).json({ announcement });
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', (req, res, next) => {
    try {
        const payload = (0, http_1.parse)(schemas_1.announcementUpdateSchema, req.body);
        const announcement = announcementService_1.announcementService.update(req.params.id, payload);
        res.json({ announcement });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', (req, res, next) => {
    try {
        announcementService_1.announcementService.remove(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
