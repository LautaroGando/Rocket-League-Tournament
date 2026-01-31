"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calculateDivisionStats } from "@/helpers/statsHelper";
import { IMatch, IPlayer } from "@/interfaces";
import { Prisma } from "@prisma/client";

export async function updateMatch(
  tournamentId: string,
  divisionId: string,
  matchId: string,
  score1: number,
  score2: number,
  isOvertime: boolean,
  player1Stats?: { shots: number; saves: number; pointsInMatch: number },
  player2Stats?: { shots: number; saves: number; pointsInMatch: number },
  scheduledDate?: Date,
) {
  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        score1,
        score2,
        played: true,
        isOvertime,
        p1Shots: player1Stats?.shots || 0,
        p1Saves: player1Stats?.saves || 0,
        p1Points: player1Stats?.pointsInMatch || 0,
        p2Shots: player2Stats?.shots || 0,
        p2Saves: player2Stats?.saves || 0,
        p2Points: player2Stats?.pointsInMatch || 0,
        scheduledDate: scheduledDate,
      } as unknown as Prisma.MatchUpdateInput,
    });

    if (match.nextMatchId && score1 !== null && score2 !== null) {
      const winnerName =
        score1 > score2
          ? match.player1Name
          : score2 > score1
            ? match.player2Name
            : null;
      if (winnerName) {
        const nextMatch = await prisma.match.findUnique({
          where: { id: match.nextMatchId },
        });
        if (nextMatch) {
          const updateField =
            match.nextMatchSlot === 1 ? "player1Name" : "player2Name";
          await prisma.match.update({
            where: { id: match.nextMatchId },
            data: {
              [updateField]: winnerName,
            },
          });
        }
      }
    }

    const allMatches = await prisma.match.findMany({
      where: { divisionId },
    });
    const allPlayers = await prisma.player.findMany({
      where: { divisionId },
    });

    const mappedMatches: IMatch[] = allMatches.map((m) => ({
      id: m.id,
      divisionId: m.divisionId,
      player1: m.player1Name,
      player2: m.player2Name,
      score1: m.score1,
      score2: m.score2,
      played: m.played,
      isOvertime: m.isOvertime,
      round: m.round,
      nextMatchId: m.nextMatchId || undefined,
      nextMatchSlot: (m.nextMatchSlot as 1 | 2) || undefined,
      player1Stats: {
        shots: m.p1Shots,
        saves: m.p1Saves,
        pointsInMatch: m.p1Points,
      },
      player2Stats: {
        shots: m.p2Shots,
        saves: m.p2Saves,
        pointsInMatch: m.p2Points,
      },
    }));

    const calculatedPlayers = calculateDivisionStats(
      allPlayers as unknown as IPlayer[],
      mappedMatches,
    );

    const updates = calculatedPlayers.map((p) => {
      const dbPlayer = allPlayers.find((ap) => ap.name === p.name);
      return prisma.player.update({
        where: { id: dbPlayer?.id || "" },
        data: {
          points: p.points,
          gamesPlayed: p.gamesPlayed,
          matchesWon: p.matchesWon,
          matchesLost: p.matchesLost,
          matchesTied: p.matchesTied,
          extraTimeGames: p.extraTimeGames,
          goalsInFavor: p.goalsInFavor,
          goalsAgainst: p.goalsAgainst,
          goalDifference: p.goalDifference,
          pointsInMatch: p.pointsInMatch,
          shooting: p.shooting,
          saved: p.saved,
        },
      });
    });

    await prisma.$transaction(updates);

    revalidatePath("/");
    return match;
  } catch (error) {
    console.error("Error updating match:", error);
    throw new Error("Failed to update match");
  }
}
