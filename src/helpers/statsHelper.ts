import { IPlayer, IMatch } from "@/interfaces";
import { resetPlayerStats } from "./playerHelper";

export const calculateDivisionStats = (
  players: IPlayer[],
  matches: IMatch[],
): IPlayer[] => {
  const resetPlayers = players.map((p) => resetPlayerStats(p));

  matches.forEach((m) => {
    if (m.played && m.score1 !== null && m.score2 !== null) {
      const p1Index = resetPlayers.findIndex((p) => p.name === m.player1);
      const p2Index = resetPlayers.findIndex((p) => p.name === m.player2);

      if (p1Index !== -1 && p2Index !== -1) {
        const p1 = resetPlayers[p1Index];
        const p2 = resetPlayers[p2Index];

        p1.gamesPlayed++;
        p2.gamesPlayed++;
        p1.goalsInFavor += m.score1;
        p2.goalsInFavor += m.score2;
        p1.goalsAgainst += m.score2;
        p2.goalsAgainst += m.score1;

        // Stats detail
        if (m.player1Stats) {
          p1.shooting += m.player1Stats.shots;
          p1.saved += m.player1Stats.saves;
          p1.pointsInMatch += m.player1Stats.pointsInMatch;
        }
        if (m.player2Stats) {
          p2.shooting += m.player2Stats.shots;
          p2.saved += m.player2Stats.saves;
          p2.pointsInMatch += m.player2Stats.pointsInMatch;
        }

        if (m.isOvertime) {
          // Rule: Overtime matches are ties for both players, winner gets +1 in TE column
          p1.matchesTied++;
          p2.matchesTied++;
          p1.points += 1;
          p2.points += 1;

          if (m.score1 > m.score2) {
            p1.extraTimeGames++;
            p1.points += 1; // Winner gets 2 points total (1 from tie + 1 from TE win)
          } else if (m.score2 > m.score1) {
            p2.extraTimeGames++;
            p2.points += 1; // Winner gets 2 points total (1 from tie + 1 from TE win)
          }
        } else {
          // Normal scoring
          if (m.score1 > m.score2) {
            p1.matchesWon++;
            p2.matchesLost++;
            p1.points += 3;
          } else if (m.score2 > m.score1) {
            p2.matchesWon++;
            p1.matchesLost++;
            p2.points += 3;
          } else {
            p1.matchesTied++;
            p2.matchesTied++;
            p1.points += 1;
            p2.points += 1;
          }
        }

        p1.goalDifference = p1.goalsInFavor - p1.goalsAgainst;
        p2.goalDifference = p2.goalsInFavor - p2.goalsAgainst;
      }
    }
  });

  return resetPlayers;
};
