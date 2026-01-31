"use server";

import { prisma } from "@/lib/prisma";
import { TournamentType } from "@/enums";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { PrismaTournamentPayload } from "@/types/prisma-payloads";

export async function getTournaments() {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        champion: true,
        divisions: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            players: true,
            matches: {
              orderBy: {
                id: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    } as unknown as Prisma.TournamentFindManyArgs);
    return tournaments as unknown as PrismaTournamentPayload[];
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return [];
  }
}

// Shadow type to handle missing fields in out-of-sync Prisma Client

export async function createTournament(
  name: string,
  playersData: { name: string }[],
  initialDivisionName: string = "Clasificación",
  type: TournamentType = TournamentType.LEAGUE,
) {
  try {
    const tournament = await prisma.tournament.create({
      data: {
        name,
        type,
        divisions: {
          create: {
            name: initialDivisionName,
            players: {
              create: playersData.map((p) => ({
                name: p.name,
              })),
            },
          },
        },
      },
      include: {
        divisions: {
          include: {
            players: true,
            matches: true,
          },
        },
      },
    });
    revalidatePath("/");
    return tournament;
  } catch (error) {
    console.error("Error creating tournament:", error);
    throw new Error("Failed to create tournament");
  }
}

export async function deleteTournament(id: string) {
  try {
    await prisma.tournament.delete({
      where: { id },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting tournament:", error);
    throw new Error("Failed to delete tournament");
  }
}

export async function finishTournament(tournamentId: string) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { divisions: { include: { players: true, matches: true } } },
    });

    if (!tournament) throw new Error("Tournament not found");

    let championId = null;

    if (tournament.type === TournamentType.LEAGUE) {
      const regularDivisions = tournament.divisions.filter(
        (d) => !d.name.toLowerCase().includes("promoc"),
      );

      const allPlayers = regularDivisions.flatMap((d) => d.players);

      if (allPlayers.length > 0) {
        allPlayers.sort(
          (a, b) =>
            b.points - a.points ||
            b.goalDifference - a.goalDifference ||
            b.goalsInFavor - a.goalsInFavor,
        );
        championId = allPlayers[0].id;
      }
    } else if (
      tournament.type === TournamentType.CUP ||
      tournament.type === TournamentType.CHAMPIONS
    ) {
      const allMatches = tournament.divisions.flatMap((d) => d.matches);
      const sortedMatches = allMatches.sort((a, b) => b.round - a.round);
      const finalMatch = sortedMatches[0];

      if (finalMatch && finalMatch.played) {
        if ((finalMatch.score1 ?? -1) > (finalMatch.score2 ?? -1)) {
          const winnerName = finalMatch.player1Name;
          const division = tournament.divisions.find(
            (d) => d.id === finalMatch.divisionId,
          );
          const winner = division?.players.find((p) => p.name === winnerName);
          championId = winner?.id || null;
        } else if ((finalMatch.score2 ?? -1) > (finalMatch.score1 ?? -1)) {
          const winnerName = finalMatch.player2Name;
          const division = tournament.divisions.find(
            (d) => d.id === finalMatch.divisionId,
          );
          const winner = division?.players.find((p) => p.name === winnerName);
          championId = winner?.id || null;
        }
      }
    }

    if (championId) {
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          status: "FINISHED",
          championId: championId,
        } as unknown as Prisma.TournamentUpdateInput,
      });
    } else {
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          status: "FINISHED",
        } as unknown as Prisma.TournamentUpdateInput,
      });
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Failed to finish tournament", error);
    throw error;
  }
}

export async function updateTournamentName(id: string, name: string) {
  try {
    await prisma.tournament.update({
      where: { id },
      data: { name },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error updating tournament name:", error);
    throw new Error("Failed to update tournament name");
  }
}
