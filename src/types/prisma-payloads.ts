export interface PrismaMatchPayload {
  id: string;
  divisionId: string;
  player1Name: string;
  player2Name: string;
  score1: number | null;
  score2: number | null;
  played: boolean;
  isOvertime: boolean;
  p1Shots: number;
  p1Saves: number;
  p1Points: number;
  p2Shots: number;
  p2Saves: number;
  p2Points: number;
  round: number;
  nextMatchId: string | null;
  nextMatchSlot: number | null;
  scheduledDate: Date | null | string;
}

export interface PrismaPlayerPayload {
  id: string;
  name: string;
  divisionId: string;
  points: number;
  gamesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesTied: number;
  extraTimeGames: number;
  goalsInFavor: number;
  goalsAgainst: number;
  goalDifference: number;
  pointsInMatch: number;
  shooting: number;
  saved: number;
}

export interface PrismaDivisionPayload {
  id: string;
  name: string;
  tournamentId: string;
  directPromotionSpots: number;
  playoffPromotionSpots: number;
  directRelegationSpots: number;
  playoffRelegationSpots: number;
  players: PrismaPlayerPayload[];
  matches: PrismaMatchPayload[];
}

export interface PrismaTournamentPayload {
  id: string;
  name: string;
  date: Date | string;
  type: string;
  status: string;
  championId: string | null;
  champion: { id: string; name: string } | null;
  divisions: PrismaDivisionPayload[];
}
