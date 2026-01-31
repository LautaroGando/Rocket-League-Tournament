"use server";

import { IPlayer } from "@/interfaces";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  generateLeagueFixture,
  generateCupFixture,
} from "@/helpers/fixtureHelper";
import { TournamentType } from "@/enums";
import { Player } from "@prisma/client";

export async function generateFixtureAction(
  tournamentId: string,
  divisionId: string,
) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });
    const division = await prisma.division.findUnique({
      where: { id: divisionId },
      include: { players: true },
    });

    if (!tournament || !division)
      throw new Error("Tournament or Division not found");

    const isCup =
      tournament.type === TournamentType.CUP ||
      (tournament.type === TournamentType.CHAMPIONS &&
        (division.name.toLowerCase().includes("playoff") ||
          division.name.toLowerCase().includes("fase final")));

    const generatedMatches = isCup
      ? generateCupFixture(
          divisionId,
          division.players as unknown as IPlayer[],
          tournament.type === TournamentType.CUP,
        )
      : generateLeagueFixture(
          divisionId,
          division.players as unknown as IPlayer[],
        );

    const matchesData = generatedMatches.map((m) => ({
      id: m.id,
      divisionId,
      player1Name: m.player1,
      player2Name: m.player2,
      score1: m.score1,
      score2: m.score2,
      played: m.played,
      round: m.round,
      nextMatchId: m.nextMatchId || null,
      nextMatchSlot: m.nextMatchSlot || null,
      isOvertime: false,
    }));

    await prisma.match.createMany({
      data: matchesData,
    });

    revalidatePath("/");
  } catch (error) {
    console.error("Error generating fixture:", error);
    throw new Error("Failed to generate fixture");
  }
}

export async function createPromotionDivision(
  tournamentId: string,
  sourceDivId: string,
  targetDivId: string,
  sourceDirectSpots: number,
  targetDirectSpots: number,
  playoffSpots: number,
) {
  try {
    const [sourceDiv, targetDiv] = await Promise.all([
      prisma.division.findUnique({
        where: { id: sourceDivId },
        include: { players: true },
      }),
      prisma.division.findUnique({
        where: { id: targetDivId },
        include: { players: true },
      }),
    ]);

    if (!sourceDiv || !targetDiv) throw new Error("Divisions not found");

    const sortFn = (a: Player, b: Player) =>
      b.points - a.points || b.goalDifference - a.goalDifference;

    const sortedSource = [...sourceDiv.players].sort(sortFn);
    const sortedTarget = [...targetDiv.players].sort(sortFn);

    const playoffRelCandidates = sortedSource.slice(
      Math.max(0, sortedSource.length - sourceDirectSpots - playoffSpots),
      Math.max(0, sortedSource.length - sourceDirectSpots),
    );

    const playoffPromCandidates = sortedTarget.slice(
      targetDirectSpots,
      targetDirectSpots + playoffSpots,
    );

    const promoDiv = await prisma.division.create({
      data: {
        name: `Promoción ${sourceDiv.name} vs ${targetDiv.name}`,
        tournamentId,
      },
    });

    const playersToAdd = [
      ...playoffRelCandidates.map((p) => p.name),
      ...playoffPromCandidates.map((p) => p.name),
    ];

    if (playersToAdd.length > 0) {
      await prisma.player.createMany({
        data: playersToAdd.map((name) => ({
          name,
          divisionId: promoDiv.id,
        })),
      });

      // Generate Single Matches with Cross-Seeding
      // Rel Candidates: Sorted Best to Worst (e.g. 7th, 8th)
      // Prom Candidates: Sorted Best to Worst (e.g. 3rd, 4th)
      // Pairing: Best Rel (7th) vs Worst Prom (4th)
      //          Worst Rel (8th) vs Best Prom (3rd)
      const reversedProm = [...playoffPromCandidates].reverse();
      const matchesData = [];

      for (let i = 0; i < playoffRelCandidates.length; i++) {
        if (i < reversedProm.length) {
          matchesData.push({
            divisionId: promoDiv.id,
            player1Name: playoffRelCandidates[i].name, // Higher Div (Defender)
            player2Name: reversedProm[i].name, // Lower Div (Attacker)
            score1: null,
            score2: null,
            played: false,
            round: 1,
            isOvertime: false,
          });
        }
      }

      if (matchesData.length > 0) {
        await prisma.match.createMany({
          data: matchesData,
        });
      }
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error creating promotion division:", error);
    throw new Error("Failed to create promotion division");
  }
}

export async function createPlayoffsDivision(
  tournamentId: string,
  spotsPerGroup: number,
) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { divisions: { include: { players: true } } },
    });

    if (!tournament) throw new Error("Tournament not found");

    const regularDivisions = tournament.divisions.filter(
      (d) =>
        !d.name.includes("Fase Final") &&
        !d.name.toLowerCase().includes("promoc"),
    );

    const qualifiedPlayers: string[] = [];

    regularDivisions.forEach((div) => {
      const sorted = [...div.players]
        .sort(
          (a: Player, b: Player) =>
            b.points - a.points || b.goalDifference - a.goalDifference,
        )
        .slice(0, spotsPerGroup);

      qualifiedPlayers.push(...sorted.map((p) => p.name));
    });

    if (qualifiedPlayers.length === 0) throw new Error("No players qualified");

    const finalDiv = await prisma.division.create({
      data: {
        name: "Fase Final",
        tournamentId,
      },
    });

    await prisma.player.createMany({
      data: qualifiedPlayers.map((name) => ({
        name,
        divisionId: finalDiv.id,
      })),
    });

    revalidatePath("/");
  } catch (error) {
    console.error("Error creating playoffs division:", error);
    throw new Error("Failed to create playoffs division");
  }
}

export async function createNextSeason(
  tournamentId: string,
  seasonName: string,
) {
  try {
    const oldTournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        divisions: {
          include: {
            players: true,
            matches: true,
          },
        },
      },
    });

    if (!oldTournament) throw new Error("Tournament not found");

    const regularDivs = oldTournament.divisions.filter(
      (d) =>
        !d.name.includes("Promoción") &&
        !d.name.toLowerCase().includes("fase final"),
    );
    const promoDivs = oldTournament.divisions.filter((d) =>
      d.name.includes("Promoción"),
    );

    const aboveOf = new Map<string, string>();
    const belowOf = new Map<string, string>();

    promoDivs.forEach((pd) => {
      const match = pd.name.match(/Promoción (.+) vs (.+)/);
      if (match) {
        const highName = match[1].trim();
        const lowName = match[2].trim();
        aboveOf.set(lowName, highName);
        belowOf.set(highName, lowName);
      }
    });

    const playerDestinations = new Map<string, string>();

    const leagueSortFn = (a: Player, b: Player) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsInFavor - a.goalsInFavor;

    for (const div of regularDivs) {
      const sorted = [...div.players].sort(leagueSortFn);

      sorted.forEach((p) => playerDestinations.set(p.name, div.name));

      const dpCount = div.directPromotionSpots || 0;
      const drCount = div.directRelegationSpots || 0;

      const directPromoted = sorted.slice(0, dpCount);
      const directRelegated = sorted.slice(
        Math.max(0, sorted.length - drCount),
      );

      directPromoted.forEach((p) => {
        const target = aboveOf.get(div.name);
        if (target) playerDestinations.set(p.name, target);
      });

      directRelegated.forEach((p) => {
        const target = belowOf.get(div.name);
        if (target) playerDestinations.set(p.name, target);
      });
    }

    for (const pd of promoDivs) {
      const matchNameMatch = pd.name.match(/Promoción (.+) vs (.+)/);
      if (!matchNameMatch) continue;
      const highName = matchNameMatch[1].trim();
      const lowName = matchNameMatch[2].trim();

      pd.matches
        .filter((m) => m.played && m.score1 !== null && m.score2 !== null)
        .forEach((m) => {
          const p1Winner = m.score1! > m.score2!;
          const winner = p1Winner ? m.player1Name : m.player2Name;
          const loser = p1Winner ? m.player2Name : m.player1Name;

          playerDestinations.set(winner, highName);
          playerDestinations.set(loser, lowName);
        });
    }

    const newTournament = await prisma.tournament.create({
      data: {
        name: seasonName,
        type: oldTournament.type,
        divisions: {
          create: regularDivs.map((d) => ({
            name: d.name,
            directPromotionSpots: d.directPromotionSpots,
            playoffPromotionSpots: d.playoffPromotionSpots,
            directRelegationSpots: d.directRelegationSpots,
            playoffRelegationSpots: d.playoffRelegationSpots,
          })),
        },
      },
      include: { divisions: true },
    });

    const playersByDiv: Record<string, string[]> = {};
    playerDestinations.forEach((divName, playerName) => {
      if (!playersByDiv[divName]) playersByDiv[divName] = [];
      playersByDiv[divName].push(playerName);
    });

    for (const divName in playersByDiv) {
      const newDiv = newTournament.divisions.find((d) => d.name === divName);
      if (newDiv) {
        await prisma.player.createMany({
          data: playersByDiv[divName].map((name) => ({
            name,
            divisionId: newDiv.id,
          })),
        });
      }
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error creating next season:", error);
    throw new Error("Failed to create next season");
  }
}
