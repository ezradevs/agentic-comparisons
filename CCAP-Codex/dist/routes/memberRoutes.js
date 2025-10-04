"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const memberService_1 = require("../services/memberService");
const schemas_1 = require("../types/schemas");
const http_1 = require("../utils/http");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.get('/', (req, res) => {
    const { status, search } = req.query;
    const members = memberService_1.memberService.list({
        status: typeof status === 'string' ? status : undefined,
        search: typeof search === 'string' ? search : undefined
    });
    res.json({ members });
});
router.get('/stats/by-status', (_req, res) => {
    const stats = memberService_1.memberService.countByStatus();
    res.json({ stats });
});
router.get('/:id', (req, res, next) => {
    try {
        const member = memberService_1.memberService.getById(req.params.id);
        if (!member) {
            res.status(404).json({ error: 'Member not found' });
            return;
        }
        res.json({ member });
    }
    catch (error) {
        next(error);
    }
});
router.post('/', (req, res, next) => {
    try {
        const payload = (0, http_1.parse)(schemas_1.memberCreateSchema, req.body);
        const member = memberService_1.memberService.create(payload);
        res.status(201).json({ member });
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', (req, res, next) => {
    try {
        const payload = (0, http_1.parse)(schemas_1.memberUpdateSchema, req.body);
        const member = memberService_1.memberService.update(req.params.id, payload);
        res.json({ member });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', (req, res, next) => {
    try {
        memberService_1.memberService.remove(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
