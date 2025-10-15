import { SwissPairingEngine } from './swissPairing';
import { RoundRobinPairingEngine } from './roundRobinPairing';
import { EliminationPairingEngine } from './eliminationPairing';
import { TournamentPlayer, Game, Pairing, TournamentType } from './types';

export class TournamentEngine {
  static generatePairings(
    type: TournamentType,
    players: TournamentPlayer[],
    round: number,
    previousGames: Game[]
  ): Pairing[] {
    switch (type) {
      case 'swiss':
        return SwissPairingEngine.generatePairings(players, round, previousGames);

      case 'round_robin':
        return RoundRobinPairingEngine.generateRoundPairings(players, round);

      case 'single_elimination':
        return EliminationPairingEngine.generateSingleEliminationRound(
          players,
          round,
          previousGames
        );

      case 'double_elimination':
        return EliminationPairingEngine.generateDoubleEliminationRound(
          players,
          round,
          previousGames
        );

      default:
        throw new Error(`Unsupported tournament type: ${type}`);
    }
  }

  static calculateTiebreaks(players: TournamentPlayer[], games: Game[]): void {
    SwissPairingEngine.calculateTiebreaks(players, games);
  }

  static calculateRoundsNeeded(
    type: TournamentType,
    playerCount: number
  ): number {
    switch (type) {
      case 'swiss':
        // Standard Swiss: ceil(log2(n)) + 1
        return Math.min(Math.ceil(Math.log2(playerCount)) + 1, playerCount - 1);

      case 'round_robin':
        return playerCount % 2 === 0 ? playerCount - 1 : playerCount;

      case 'single_elimination':
        return EliminationPairingEngine.calculateRoundsNeeded(playerCount, false);

      case 'double_elimination':
        return EliminationPairingEngine.calculateRoundsNeeded(playerCount, true);

      default:
        return 1;
    }
  }
}

export * from './types';
export { SwissPairingEngine } from './swissPairing';
export { RoundRobinPairingEngine } from './roundRobinPairing';
export { EliminationPairingEngine } from './eliminationPairing';
