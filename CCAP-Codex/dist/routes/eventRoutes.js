"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const eventService_1 = require("../services/eventService");
const schemas_1 = require("../types/schemas");
const http_1 = require("../utils/http");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.get('/', (req, res) => {
    const { status, category, search, upcomingOnly } = req.query;
    const events = eventService_1.eventService.list({
        status: typeof status === 'string' ? status : undefined,
        category: typeof category === 'string' ? category : undefined,
        search: typeof search === 'string' ? search : undefined,
        upcomingOnly: upcomingOnly === 'true'
    });
    res.json({ events });
});
router.get('/:id', (req, res) => {
    const event = eventService_1.eventService.getById(req.params.id);
    if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
    }
    const registrations = eventService_1.eventService.registrationDetails(event.id);
    const matches = eventService_1.eventService.matchDetails(event.id);
    const standings = eventService_1.eventService.standings(event.id);
    res.json({ event, registrations, matches, standings });
});
router.post('/', (req, res, next) => {
    try {
        const payload = (0, http_1.parse)(schemas_1.eventCreateSchema, req.body);
        const event = eventService_1.eventService.create(payload);
        res.status(201).json({ event });
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', (req, res, next) => {
    try {
        const payload = (0, http_1.parse)(schemas_1.eventUpdateSchema, req.body);
        const event = eventService_1.eventService.update(req.params.id, payload);
        res.json({ event });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', (req, res, next) => {
    try {
        eventService_1.eventService.remove(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id/registrations', (req, res) => {
    const registrations = eventService_1.eventService.registrationDetails(req.params.id);
    res.json({ registrations });
});
router.post('/:id/registrations', (req, res, next) => {
    try {
        const payload = (0, http_1.parse)(schemas_1.registrationCreateSchema, req.body);
        const registration = eventService_1.eventService.createRegistration({ ...payload, event_id: req.params.id });
        res.status(201).json({ registration });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/registrations/:id', (req, res, next) => {
    try {
        const payload = (0, http_1.parse)(schemas_1.registrationUpdateSchema, req.body);
        const registration = eventService_1.eventService.updateRegistration(req.params.id, payload);
        res.json({ registration });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/registrations/:id', (req, res, next) => {
    try {
        eventService_1.eventService.removeRegistration(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id/matches', (req, res) => {
    const matches = eventService_1.eventService.matchDetails(req.params.id);
    res.json({ matches });
});
router.post('/:id/matches', (req, res, next) => {
    try {
        const payload = (0, http_1.parse)(schemas_1.matchCreateSchema, { ...req.body, event_id: req.params.id });
        const match = eventService_1.eventService.createMatch(payload);
        res.status(201).json({ match });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/matches/:id', (req, res, next) => {
    try {
        const payload = (0, http_1.parse)(schemas_1.matchUpdateSchema, req.body);
        const match = eventService_1.eventService.updateMatch(req.params.id, payload);
        res.json({ match });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/matches/:id', (req, res, next) => {
    try {
        eventService_1.eventService.removeMatch(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id/standings', (req, res) => {
    const standings = eventService_1.eventService.standings(req.params.id);
    res.json({ standings });
});
exports.default = router;
