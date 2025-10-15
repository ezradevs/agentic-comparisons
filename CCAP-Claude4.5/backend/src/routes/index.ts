import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import * as authController from '../controllers/authController';
import * as playersController from '../controllers/playersController';
import * as tournamentsController from '../controllers/tournamentsController';
import * as gamesController from '../controllers/gamesController';
import * as standingsController from '../controllers/standingsController';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (public)
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/me', authController.getCurrentUser);

// Protected routes - require authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Players routes
router.get('/players', playersController.getAllPlayers);
router.get('/players/:id', playersController.getPlayer);
router.post('/players', playersController.createPlayer);
router.put('/players/:id', playersController.updatePlayer);
router.delete('/players/:id', playersController.deletePlayer);
router.get('/players/:playerId/history', standingsController.getPlayerTournamentHistory);

// Tournaments routes
router.get('/tournaments', tournamentsController.getAllTournaments);
router.get('/tournaments/:id', tournamentsController.getTournament);
router.post('/tournaments', tournamentsController.createTournament);
router.put('/tournaments/:id', tournamentsController.updateTournament);
router.delete('/tournaments/:id', tournamentsController.deleteTournament);

// Tournament players
router.get('/tournaments/:id/players', tournamentsController.getTournamentPlayers);
router.post('/tournaments/:id/players', tournamentsController.addPlayerToTournament);
router.delete('/tournaments/:id/players/:playerId', tournamentsController.removePlayerFromTournament);

// Tournament rounds
router.post('/tournaments/:id/rounds/next', tournamentsController.startNextRound);

// Games routes
router.get('/tournaments/:id/games', gamesController.getTournamentGames);
router.get('/games/:gameId', gamesController.getGame);
router.put('/games/:gameId/result', gamesController.updateGameResult);
router.delete('/games/:gameId/result', gamesController.clearGameResult);

// Standings routes
router.get('/tournaments/:id/standings', standingsController.getTournamentStandings);

export default router;
