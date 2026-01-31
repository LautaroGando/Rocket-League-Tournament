export interface IPlayer {
  id?: string;
  name: string;
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
