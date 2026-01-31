"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addDivision(tournamentId: string, name: string) {
  try {
    const division = await prisma.division.create({
      data: {
        name,
        tournamentId,
      },
      include: {
        players: true,
        matches: true,
      },
    });
    revalidatePath("/");
    return division;
  } catch (error) {
    console.error("Error adding division:", error);
    throw new Error("Failed to add division");
  }
}

export async function deleteDivision(divisionId: string) {
  try {
    await prisma.division.delete({
      where: { id: divisionId },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting division:", error);
    throw new Error("Failed to delete division");
  }
}

export async function updateDivisionSettings(
  divisionId: string,
  settings: {
    directPromotionSpots: number;
    playoffPromotionSpots: number;
    directRelegationSpots: number;
    playoffRelegationSpots: number;
  },
) {
  try {
    await prisma.division.update({
      where: { id: divisionId },
      data: settings,
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error updating division settings:", error);
    throw new Error("Failed to update division settings");
  }
}

export async function addPlayersToDivision(
  divisionId: string,
  playersNames: string[],
) {
  try {
    // Create multiple players
    // Prisma createMany is supported but we might want to return them.
    // Usually createMany doesn't return the created records in all DBs, but for PG it might.
    // Safe bet: transaction or createMany.

    await prisma.player.createMany({
      data: playersNames.map((name) => ({
        name,
        divisionId,
      })),
    });

    revalidatePath("/");
  } catch (error) {
    console.error("Error adding players to division:", error);
    throw new Error("Failed to add players");
  }
}

export async function removePlayer(divisionId: string, playerName: string) {
  try {
    await prisma.player.deleteMany({
      where: {
        divisionId,
        name: playerName,
      },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error removing player:", error);
    throw new Error("Failed to remove player");
  }
}

export async function updateDivisionName(id: string, name: string) {
  try {
    await prisma.division.update({
      where: { id },
      data: { name },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error updating division name:", error);
    throw new Error("Failed to update division name");
  }
}

export async function updatePlayerName(
  divisionId: string,
  oldName: string,
  newName: string,
) {
  try {
    await prisma.$transaction([
      // 1. Update the player name in the Player table
      prisma.player.updateMany({
        where: { divisionId, name: oldName },
        data: { name: newName },
      }),
      // 2. Update player1Name in matches
      prisma.match.updateMany({
        where: { divisionId, player1Name: oldName },
        data: { player1Name: newName },
      }),
      // 3. Update player2Name in matches
      prisma.match.updateMany({
        where: { divisionId, player2Name: oldName },
        data: { player2Name: newName },
      }),
    ]);
    revalidatePath("/");
  } catch (error) {
    console.error("Error updating player name:", error);
    throw new Error("Failed to update player name");
  }
}
