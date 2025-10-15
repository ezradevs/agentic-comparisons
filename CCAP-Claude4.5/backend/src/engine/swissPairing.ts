import { TournamentPlayer, Pairing, Game } from './types';

export class SwissPairingEngine {
  /**
   * Generate pairings for the next round using Swiss system
   */
  static generatePairings(
    players: TournamentPlayer[],
    round: number,
    previousGames: Game[]
  ): Pairing[] {
    const activePlayers = players.filter(p => !p.withdrew);

    if (activePlayers.length === 0) {
      return [];
    }

    // For round 1, pair by rating
    if (round === 1) {
      return this.pairFirstRound(activePlayers);
    }

    // For subsequent rounds, use Swiss pairing algorithm
    return this.pairSwissSystem(activePlayers, previousGames);
  }

  /**
   * Pair first round by rating (top half vs bottom half)
   */
  private static pairFirstRound(players: TournamentPlayer[]): Pairing[] {
    const sorted = [...players].sort((a, b) => b.rating - a.rating);
    const pairings: Pairing[] = [];
    const halfPoint = Math.ceil(sorted.length / 2);

    for (let i = 0; i < halfPoint; i++) {
      if (i + halfPoint < sorted.length) {
        // Alternate colors based on board number
        const whitePlayer = i % 2 === 0 ? sorted[i] : sorted[i + halfPoint];
        const blackPlayer = i % 2 === 0 ? sorted[i + halfPoint] : sorted[i];

        pairings.push({
          white_player_id: whitePlayer.id,
          black_player_id: blackPlayer.id,
          board_number: i + 1
        });
      } else {
        // Odd player gets a bye
        pairings.push({
          white_player_id: sorted[i].id,
          black_player_id: null,
          board_number: i + 1
        });
      }
    }

    return pairings;
  }

  /**
   * Swiss system pairing for subsequent rounds
   */
  private static pairSwissSystem(
    players: TournamentPlayer[],
    previousGames: Game[]
  ): Pairing[] {
    // Sort players by points (descending), then by rating
    const sorted = [...players].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.rating - a.rating;
    });

    const paired = new Set<number>();
    const pairings: Pairing[] = [];
    let boardNumber = 1;

    // Build opponent history and color history for each player
    const opponentMap = this.buildOpponentMap(previousGames);
    const colorMap = this.buildColorMap(previousGames);

    // Try to pair players within same score group
    for (let i = 0; i < sorted.length; i++) {
      if (paired.has(sorted[i].id)) continue;

      let opponentFound = false;

      // Look for opponent in same score group, then expand search
      for (let j = i + 1; j < sorted.length; j++) {
        if (paired.has(sorted[j].id)) continue;

        const player1 = sorted[i];
        const player2 = sorted[j];

        // Check if they've already played
        if (this.hasPlayed(player1.id, player2.id, opponentMap)) continue;

        // Check color preference
        const { white, black } = this.determineColors(
          player1.id,
          player2.id,
          colorMap
        );

        pairings.push({
          white_player_id: white,
          black_player_id: black,
          board_number: boardNumber++
        });

        paired.add(player1.id);
        paired.add(player2.id);
        opponentFound = true;
        break;
      }

      // If no opponent found, player gets a bye
      if (!opponentFound && !paired.has(sorted[i].id)) {
        // Check if player already had a bye
        const hadBye = previousGames.some(
          g => (g.white_player_id === sorted[i].id || g.black_player_id === sorted[i].id)
            && (g.white_player_id === null || g.black_player_id === null)
        );

        if (!hadBye) {
          pairings.push({
            white_player_id: sorted[i].id,
            black_player_id: null,
            board_number: boardNumber++
          });
          paired.add(sorted[i].id);
        }
      }
    }

    return pairings;
  }

  /**
   * Build map of opponents for each player
   */
  private static buildOpponentMap(games: Game[]): Map<number, Set<number>> {
    const map = new Map<number, Set<number>>();

    games.forEach(game => {
      if (game.white_player_id && game.black_player_id) {
        if (!map.has(game.white_player_id)) {
          map.set(game.white_player_id, new Set());
        }
        if (!map.has(game.black_player_id)) {
          map.set(game.black_player_id, new Set());
        }

        map.get(game.white_player_id)!.add(game.black_player_id);
        map.get(game.black_player_id)!.add(game.white_player_id);
      }
    });

    return map;
  }

  /**
   * Build map of color history for each player
   */
  private static buildColorMap(games: Game[]): Map<number, string[]> {
    const map = new Map<number, string[]>();

    games.forEach(game => {
      if (game.white_player_id) {
        if (!map.has(game.white_player_id)) {
          map.set(game.white_player_id, []);
        }
        map.get(game.white_player_id)!.push('W');
      }

      if (game.black_player_id) {
        if (!map.has(game.black_player_id)) {
          map.set(game.black_player_id, []);
        }
        map.get(game.black_player_id)!.push('B');
      }
    });

    return map;
  }

  /**
   * Check if two players have already played each other
   */
  private static hasPlayed(
    playerId1: number,
    playerId2: number,
    opponentMap: Map<number, Set<number>>
  ): boolean {
    const opponents = opponentMap.get(playerId1);
    return opponents ? opponents.has(playerId2) : false;
  }

  /**
   * Determine which player should have white based on color history
   */
  private static determineColors(
    playerId1: number,
    playerId2: number,
    colorMap: Map<number, string[]>
  ): { white: number; black: number } {
    const colors1 = colorMap.get(playerId1) || [];
    const colors2 = colorMap.get(playerId2) || [];

    const whiteCount1 = colors1.filter(c => c === 'W').length;
    const blackCount1 = colors1.filter(c => c === 'B').length;
    const whiteCount2 = colors2.filter(c => c === 'W').length;
    const blackCount2 = colors2.filter(c => c === 'B').length;

    const colorBalance1 = whiteCount1 - blackCount1;
    const colorBalance2 = whiteCount2 - blackCount2;

    // Player with more blacks should get white
    if (colorBalance1 < colorBalance2) {
      return { white: playerId1, black: playerId2 };
    } else if (colorBalance2 < colorBalance1) {
      return { white: playerId2, black: playerId1 };
    }

    // If equal, higher rated player gets white
    return { white: playerId1, black: playerId2 };
  }

  /**
   * Calculate tiebreak scores (Buchholz and Sonneborn-Berger)
   */
  static calculateTiebreaks(
    players: TournamentPlayer[],
    games: Game[]
  ): void {
    const playerMap = new Map(players.map(p => [p.id, p]));

    players.forEach(player => {
      let buchholz = 0;
      let sonnebornBerger = 0;

      const playerGames = games.filter(
        g => g.white_player_id === player.id || g.black_player_id === player.id
      );

      playerGames.forEach(game => {
        const opponentId =
          game.white_player_id === player.id
            ? game.black_player_id
            : game.white_player_id;

        if (opponentId) {
          const opponent = playerMap.get(opponentId);
          if (opponent) {
            buchholz += opponent.points;

            // Sonneborn-Berger: sum of defeated opponents' scores + half of drawn opponents' scores
            if (game.result) {
              const isWhite = game.white_player_id === player.id;
              const won =
                (isWhite && game.result === '1-0') ||
                (!isWhite && game.result === '0-1');
              const drew = game.result === '1/2-1/2';

              if (won) {
                sonnebornBerger += opponent.points;
              } else if (drew) {
                sonnebornBerger += opponent.points * 0.5;
              }
            }
          }
        }
      });

      player.buchholz = buchholz;
      player.sonneborn_berger = sonnebornBerger;
    });
  }
}
