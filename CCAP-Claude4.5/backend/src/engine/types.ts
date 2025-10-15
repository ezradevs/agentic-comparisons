export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  rating: number;
  initial_rating?: number;
}

export interface TournamentPlayer extends Player {
  points: number;
  wins: number;
  draws: number;
  losses: number;
  games_played: number;
  buchholz: number;
  sonneborn_berger: number;
  opponents: number[];
  colors: string[];
  withdrew: boolean;
}

export interface Game {
  id?: number;
  tournament_id: number;
  round: number;
  white_player_id: number | null;
  black_player_id: number | null;
  result: string | null;
  board_number: number;
}

export interface Pairing {
  white_player_id: number;
  black_player_id: number | null;
  board_number: number;
}

export type TournamentType = 'swiss' | 'round_robin' | 'single_elimination' | 'double_elimination';
