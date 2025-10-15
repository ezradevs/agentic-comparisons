import { TournamentPlayer, Pairing } from './types';

export class RoundRobinPairingEngine {
  /**
   * Generate all pairings for a complete round robin tournament
   * Uses the "circle method" algorithm
   */
  static generateAllRounds(players: TournamentPlayer[]): Pairing[][] {
    const activePlayers = players.filter(p => !p.withdrew);
    const n = activePlayers.length;

    // If odd number of players, add a dummy (bye)
    const includesBye = n % 2 === 1;
    const totalPlayers = includesBye ? n + 1 : n;
    const rounds = totalPlayers - 1;
    const allRounds: Pairing[][] = [];

    // Create array of player IDs (with -1 for bye if needed)
    const playerIds = activePlayers.map(p => p.id);
    if (includesBye) {
      playerIds.push(-1); // Dummy player for bye
    }

    // Generate pairings for each round using circle method
    for (let round = 0; round < rounds; round++) {
      const roundPairings: Pairing[] = [];
      const half = totalPlayers / 2;

      for (let i = 0; i < half; i++) {
        const player1Idx = i;
        const player2Idx = totalPlayers - 1 - i;

        const player1Id = playerIds[player1Idx];
        const player2Id = playerIds[player2Idx];

        // Skip if either player is the dummy (bye)
        if (player1Id === -1 || player2Id === -1) {
          const actualPlayerId = player1Id === -1 ? player2Id : player1Id;
          roundPairings.push({
            white_player_id: actualPlayerId,
            black_player_id: null,
            board_number: i + 1
          });
        } else {
          // Alternate colors: even rounds start with lower index as white
          const whiteId = (round + i) % 2 === 0 ? player1Id : player2Id;
          const blackId = (round + i) % 2 === 0 ? player2Id : player1Id;

          roundPairings.push({
            white_player_id: whiteId,
            black_player_id: blackId,
            board_number: i + 1
          });
        }
      }

      allRounds.push(roundPairings);

      // Rotate players (keep first player fixed, rotate others)
      const last = playerIds.pop()!;
      playerIds.splice(1, 0, last);
    }

    return allRounds;
  }

  /**
   * Get pairings for a specific round
   */
  static generateRoundPairings(
    players: TournamentPlayer[],
    round: number
  ): Pairing[] {
    const allRounds = this.generateAllRounds(players);
    return allRounds[round - 1] || [];
  }
}
