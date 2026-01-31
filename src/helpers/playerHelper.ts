import { IPlayer } from "@/interfaces";

export const resetPlayerStats = (player: IPlayer): IPlayer => ({
  ...player,
  points: 0,
  gamesPlayed: 0,
  matchesWon: 0,
  matchesLost: 0,
  matchesTied: 0,
  extraTimeGames: 0,
  goalsInFavor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  pointsInMatch: 0,
  shooting: 0,
  saved: 0,
});
