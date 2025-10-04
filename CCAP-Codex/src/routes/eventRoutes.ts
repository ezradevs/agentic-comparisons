import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  eventService,
  CreateEventInput,
  UpdateEventInput,
  CreateRegistrationInput,
  UpdateRegistrationInput,
  CreateMatchInput,
  UpdateMatchInput
} from '../services/eventService';
import {
  eventCreateSchema,
  eventUpdateSchema,
  registrationCreateSchema,
  registrationUpdateSchema,
  matchCreateSchema,
  matchUpdateSchema
} from '../types/schemas';
import { parse } from '../utils/http';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => {
  const { status, category, search, upcomingOnly } = req.query;
  const events = eventService.list({
    status: typeof status === 'string' ? (status as any) : undefined,
    category: typeof category === 'string' ? (category as any) : undefined,
    search: typeof search === 'string' ? search : undefined,
    upcomingOnly: upcomingOnly === 'true'
  });
  res.json({ events });
});

router.get('/:id', (req, res) => {
  const event = eventService.getById(req.params.id);
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }
  const registrations = eventService.registrationDetails(event.id);
  const matches = eventService.matchDetails(event.id);
  const standings = eventService.standings(event.id);
  res.json({ event, registrations, matches, standings });
});

router.post('/', (req, res, next) => {
  try {
    const payload = parse(eventCreateSchema, req.body) as CreateEventInput;
    const event = eventService.create(payload);
    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const payload = parse(eventUpdateSchema, req.body) as UpdateEventInput;
    const event = eventService.update(req.params.id, payload);
    res.json({ event });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    eventService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/:id/registrations', (req, res) => {
  const registrations = eventService.registrationDetails(req.params.id);
  res.json({ registrations });
});

router.post('/:id/registrations', (req, res, next) => {
  try {
    const payload = parse(registrationCreateSchema, req.body) as Omit<CreateRegistrationInput, 'event_id'>;
    const registration = eventService.createRegistration({ ...payload, event_id: req.params.id });
    res.status(201).json({ registration });
  } catch (error) {
    next(error);
  }
});

router.patch('/registrations/:id', (req, res, next) => {
  try {
    const payload = parse(registrationUpdateSchema, req.body) as UpdateRegistrationInput;
    const registration = eventService.updateRegistration(req.params.id, payload);
    res.json({ registration });
  } catch (error) {
    next(error);
  }
});

router.delete('/registrations/:id', (req, res, next) => {
  try {
    eventService.removeRegistration(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/:id/matches', (req, res) => {
  const matches = eventService.matchDetails(req.params.id);
  res.json({ matches });
});

router.post('/:id/matches', (req, res, next) => {
  try {
    const payload = parse(matchCreateSchema, { ...req.body, event_id: req.params.id }) as CreateMatchInput;
    const match = eventService.createMatch(payload);
    res.status(201).json({ match });
  } catch (error) {
    next(error);
  }
});

router.patch('/matches/:id', (req, res, next) => {
  try {
    const payload = parse(matchUpdateSchema, req.body) as UpdateMatchInput;
    const match = eventService.updateMatch(req.params.id, payload);
    res.json({ match });
  } catch (error) {
    next(error);
  }
});

router.delete('/matches/:id', (req, res, next) => {
  try {
    eventService.removeMatch(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/:id/standings', (req, res) => {
  const standings = eventService.standings(req.params.id);
  res.json({ standings });
});

export default router;
