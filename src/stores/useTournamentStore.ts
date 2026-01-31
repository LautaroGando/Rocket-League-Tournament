"use client";

import { create } from "zustand";
import { TournamentType } from "@/enums";
import { IPlayer, ITournament } from "@/interfaces";
import * as TournamentActions from "@/actions/tournament-actions";

import * as DivisionActions from "@/actions/division-actions";
import * as MatchActions from "@/actions/match-actions";
import * as LogicActions from "@/actions/logic-actions";

import {
  PrismaMatchPayload,
  PrismaPlayerPayload,
  PrismaDivisionPayload,
  PrismaTournamentPayload,
} from "@/types/prisma-payloads";

interface Props {
  tournaments: ITournament[];
  activeTournamentId: string | null;
  isLoading: boolean;
  setActiveTournament: (id: string) => void;
  loadTournaments: () => Promise<void>;
  createTournament: (
    name: string,
    players: IPlayer[],
    initialDivisionName?: string,
    type?: TournamentType,
  ) => Promise<string | undefined>;
  deleteTournament: (id: string) => Promise<void>;
  addDivision: (
    tournamentId: string,
    name: string,
  ) => Promise<string | undefined>;
  deleteDivision: (tournamentId: string, divisionId: string) => Promise<void>;
  updateDivisionSettings: (
    tournamentId: string,
    divisionId: string,
    directProm: number,
    playoffProm: number,
    directRel: number,
    playoffRel: number,
  ) => Promise<void>;

  addPlayersToDivision: (
    tournamentId: string,
    divisionId: string,
    players: IPlayer[],
  ) => Promise<void>;

  removePlayer: (
    tournamentId: string,
    divisionId: string,
    playerName: string,
  ) => Promise<void>;

  updatePlayer: (
    tournamentId: string,
    divisionId: string,
    updatedPlayer: IPlayer,
  ) => Promise<void>;
  updateTournamentName: (id: string, name: string) => Promise<void>;
  updateDivisionName: (id: string, name: string) => Promise<void>;
  updatePlayerName: (
    divisionId: string,
    oldName: string,
    newName: string,
  ) => Promise<void>;

  generateFixture: (tournamentId: string, divisionId: string) => Promise<void>;

  updateMatch: (
    tournamentId: string,
    divisionId: string,
    matchId: string,
    score1: number,
    score2: number,
    isOvertime: boolean,
    player1Stats?: { shots: number; saves: number; pointsInMatch: number },
    player2Stats?: { shots: number; saves: number; pointsInMatch: number },
    scheduledDate?: Date,
    postponed?: boolean,
  ) => Promise<void>;

  createNextSeason: (tournamentId: string, seasonName: string) => Promise<void>;
  createPromotionDivision: (
    tournamentId: string,
    sourceDivId: string,
    targetDivId: string,
    sourceDirectSpots: number,
    targetDirectSpots: number,
    playoffSpots: number,
  ) => Promise<void>;
  createPlayoffsDivision: (
    tournamentId: string,
    spotsPerGroup: number,
  ) => Promise<void>;
  removeDivision: (
    tournamentId: string,
    divisionId: string,
    targetDivisionId: string,
  ) => Promise<void>;
  finishTournament: (tournamentId: string) => Promise<void>;
}

// Mapper helper
const mapPrismaToTournament = (data: PrismaTournamentPayload): ITournament => {
  const champ = data.champion;
  return {
    id: data.id,
    name: data.name,
    date: typeof data.date === "string" ? data.date : data.date.toISOString(),
    type: data.type as TournamentType,
    status: data.status,
    champion: champ ? { id: champ.id, name: champ.name } : null,
    divisions: data.divisions.map((d: PrismaDivisionPayload) => ({
      id: d.id,
      name: d.name,
      directPromotionSpots: d.directPromotionSpots,
      playoffPromotionSpots: d.playoffPromotionSpots,
      directRelegationSpots: d.directRelegationSpots,
      playoffRelegationSpots: d.playoffRelegationSpots,
      players: d.players
        .map((p: PrismaPlayerPayload) => ({
          name: p.name,
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
        }))
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference)
            return b.goalDifference - a.goalDifference;
          return b.goalsInFavor - a.goalsInFavor;
        }),
      matches:
        d.matches?.map((m: PrismaMatchPayload) => ({
          id: m.id,
          divisionId: m.divisionId,
          player1: m.player1Name,
          player2: m.player2Name,
          score1: m.score1,
          score2: m.score2,
          played: m.played,
          isOvertime: m.isOvertime,
          postponed: m.postponed,
          round: m.round,
          nextMatchId: m.nextMatchId || undefined,
          nextMatchSlot: m.nextMatchSlot as 1 | 2 | undefined,
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
          scheduledDate:
            typeof m.scheduledDate === "string"
              ? m.scheduledDate
              : m.scheduledDate?.toISOString(),
        })) || [],
    })),
  };
};

export const useTournamentStore = create<Props>((set, get) => ({
  tournaments: [],
  activeTournamentId: null,
  isLoading: true,

  setActiveTournament: (id) => set({ activeTournamentId: id }),

  loadTournaments: async () => {
    if (get().tournaments.length === 0) {
      set({ isLoading: true });
    }
    try {
      const data = await TournamentActions.getTournaments();
      const mapped = (data as unknown as PrismaTournamentPayload[]).map((t) =>
        mapPrismaToTournament(t),
      );
      set({ tournaments: mapped });
    } catch (e) {
      console.error("Failed to load tournaments", e);
    } finally {
      set({ isLoading: false });
    }
  },

  createTournament: async (name, players, initialDivisionName, type) => {
    set({ isLoading: true });
    try {
      const t = await TournamentActions.createTournament(
        name,
        players,
        initialDivisionName,
        type,
      );
      await get().loadTournaments();
      return t?.id;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTournament: async (id) => {
    await TournamentActions.deleteTournament(id);
    await get().loadTournaments();
  },

  addDivision: async (tId, name) => {
    const d = await DivisionActions.addDivision(tId, name);
    await get().loadTournaments();
    return d?.id;
  },

  deleteDivision: async (tId, dId) => {
    await DivisionActions.deleteDivision(dId);
    await get().loadTournaments();
  },

  updateDivisionSettings: async (tId, dId, dp, pp, dr, pr) => {
    await DivisionActions.updateDivisionSettings(dId, {
      directPromotionSpots: dp,
      playoffPromotionSpots: pp,
      directRelegationSpots: dr,
      playoffRelegationSpots: pr,
    });
    await get().loadTournaments();
  },

  addPlayersToDivision: async (tId, dId, players) => {
    await DivisionActions.addPlayersToDivision(
      dId,
      players.map((p) => p.name),
    );
    await get().loadTournaments();
  },

  removePlayer: async (tId, dId, playerName) => {
    await DivisionActions.removePlayer(dId, playerName);
    await get().loadTournaments();
  },

  updatePlayer: async () => {
    // Not implemented in server mode
  },
  updateTournamentName: async (id, name) => {
    await TournamentActions.updateTournamentName(id, name);
    await get().loadTournaments();
  },
  updateDivisionName: async (id, name) => {
    await DivisionActions.updateDivisionName(id, name);
    await get().loadTournaments();
  },
  updatePlayerName: async (dId, oldName, newName) => {
    await DivisionActions.updatePlayerName(dId, oldName, newName);
    await get().loadTournaments();
  },

  generateFixture: async (tId, dId) => {
    await LogicActions.generateFixtureAction(tId, dId);
    await get().loadTournaments();
  },

  updateMatch: async (tId, dId, mId, s1, s2, ot, p1s, p2s, sd, pp) => {
    await MatchActions.updateMatch(tId, dId, mId, s1, s2, ot, p1s, p2s, sd, pp);
    await get().loadTournaments();
  },

  createNextSeason: async (tId, seasonName) => {
    await LogicActions.createNextSeason(tId, seasonName);
    await get().loadTournaments();
  },

  createPromotionDivision: async (tId, sId, tTargetId, sDir, tDir, spots) => {
    await LogicActions.createPromotionDivision(
      tId,
      sId,
      tTargetId,
      sDir,
      tDir,
      spots,
    );
    await get().loadTournaments();
  },

  createPlayoffsDivision: async (tId, spots) => {
    await LogicActions.createPlayoffsDivision(tId, spots);
    await get().loadTournaments();
  },

  removeDivision: async (_, dId) => {
    // mapped to delete for now, ignoring target
    await DivisionActions.deleteDivision(dId);
    await get().loadTournaments();
  },
  finishTournament: async (tournamentId) => {
    await TournamentActions.finishTournament(tournamentId);
    await get().loadTournaments();
  },
}));
