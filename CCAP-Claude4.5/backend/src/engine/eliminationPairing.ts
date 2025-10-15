import { TournamentPlayer, Pairing, Game } from './types';

export class EliminationPairingEngine {
  /**
   * Generate pairings for single elimination bracket
   */
  static generateSingleEliminationRound(
    players: TournamentPlayer[],
    round: number,
    previousGames: Game[]
  ): Pairing[] {
    if (round === 1) {
      return this.generateFirstRound(players);
    }

    // Get winners from previous round
    const winners = this.getWinners(previousGames, round - 1);
    return this.pairWinners(winners, round);
  }

  /**
   * Generate pairings for double elimination bracket
   */
  static generateDoubleEliminationRound(
    players: TournamentPlayer[],
    round: number,
    previousGames: Game[]
  ): Pairing[] {
    if (round === 1) {
      return this.generateFirstRound(players);
    }

    // In double elimination, we need to track winners and losers brackets
    // This is a simplified implementation
    const roundGames = previousGames.filter(g => g.round === round - 1);
    const winners = this.getWinners(previousGames, round - 1);

    return this.pairWinners(winners, round);
  }

  /**
   * Generate first round bracket based on seeding
   */
  private static generateFirstRound(players: TournamentPlayer[]): Pairing[] {
    // Sort by rating (seeding)
    const sorted = [...players]
      .filter(p => !p.withdrew)
      .sort((a, b) => b.rating - a.rating);

    const pairings: Pairing[] = [];
    const n = sorted.length;
    const matchCount = Math.floor(n / 2);

    // Standard bracket seeding: 1 vs n, 2 vs n-1, etc.
    for (let i = 0; i < matchCount; i++) {
      pairings.push({
        white_player_id: sorted[i].id,
        black_player_id: sorted[n - 1 - i].id,
        board_number: i + 1
      });
    }

    // Handle bye if odd number
    if (n % 2 === 1) {
      pairings.push({
        white_player_id: sorted[matchCount].id,
        black_player_id: null,
        board_number: matchCount + 1
      });
    }

    return pairings;
  }

  /**
   * Get winners from a specific round
   */
  private static getWinners(games: Game[], round: number): number[] {
    const roundGames = games.filter(g => g.round === round && g.result);
    const winners: number[] = [];

    roundGames.forEach(game => {
      if (!game.result) return;

      if (game.result === 'BYE' && game.white_player_id) {
        winners.push(game.white_player_id);
      } else if (game.result === '1-0' && game.white_player_id) {
        winners.push(game.white_player_id);
      } else if (game.result === '0-1' && game.black_player_id) {
        winners.push(game.black_player_id);
      } else if (game.result === '1/2-1/2') {
        // In elimination, draws need tiebreak rules
        // For now, advance higher rated player (or could use playoff)
        if (game.white_player_id) winners.push(game.white_player_id);
      }
    });

    return winners;
  }

  /**
   * Pair winners for next round
   */
  private static pairWinners(winners: number[], round: number): Pairing[] {
    const pairings: Pairing[] = [];
    const n = winners.length;
    const matchCount = Math.floor(n / 2);

    for (let i = 0; i < matchCount; i++) {
      // Alternate colors each round
      const isWhiteFirst = round % 2 === 1;
      pairings.push({
        white_player_id: isWhiteFirst ? winners[i * 2] : winners[i * 2 + 1],
        black_player_id: isWhiteFirst ? winners[i * 2 + 1] : winners[i * 2],
        board_number: i + 1
      });
    }

    // Handle bye if odd number
    if (n % 2 === 1) {
      pairings.push({
        white_player_id: winners[n - 1],
        black_player_id: null,
        board_number: matchCount + 1
      });
    }

    return pairings;
  }

  /**
   * Calculate number of rounds needed for elimination tournament
   */
  static calculateRoundsNeeded(playerCount: number, isDouble: boolean): number {
    const singleRounds = Math.ceil(Math.log2(playerCount));
    return isDouble ? singleRounds * 2 - 1 : singleRounds;
  }
}
