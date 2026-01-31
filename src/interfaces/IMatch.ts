export interface IMatch {
  id: string;
  divisionId: string;
  player1: string; // Player Name
  player2: string; // Player Name
  score1: number | null;
  score2: number | null;
  played: boolean;
  isOvertime?: boolean;
  player1Stats?: {
    shots: number;
    saves: number;
    pointsInMatch: number;
  };
  player2Stats?: {
    shots: number;
    saves: number;
    pointsInMatch: number;
  };
  nextMatchId?: string;
  nextMatchSlot?: 1 | 2;
  round: number;
  scheduledDate?: string;
  postponed?: boolean;
}
