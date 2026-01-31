import { IMatch, IPlayer, TournamentType } from "@/interfaces";
import { resetPlayerStats } from "./playerHelper";

export const generateLeagueFixture = (
  divisionId: string,
  players: IPlayer[],
): IMatch[] => {
  let tempPlayers = [...players];
  const matches: IMatch[] = [];

  if (tempPlayers.length % 2 !== 0) {
    tempPlayers.push({
      ...resetPlayerStats({ name: "BYE" } as IPlayer),
    });
  }

  tempPlayers = tempPlayers.sort(() => Math.random() - 0.5);
  const numPlayers = tempPlayers.length;
  const homeGamesCount: { [key: string]: number } = {};
  tempPlayers.forEach((p) => (homeGamesCount[p.name] = 0));

  for (let round = 0; round < numPlayers - 1; round++) {
    for (let i = 0; i < numPlayers / 2; i++) {
      const p1Index = i;
      const p2Index = numPlayers - 1 - i;
      let p1 = tempPlayers[p1Index];
      let p2 = tempPlayers[p2Index];

      const p1Home = homeGamesCount[p1.name] || 0;
      const p2Home = homeGamesCount[p2.name] || 0;

      let swap = false;
      if (p1Home > p2Home) {
        swap = true;
      } else if (p1Home === p2Home) {
        if ((round + i) % 2 === 1) swap = true;
      }

      if (swap) {
        [p1, p2] = [p2, p1];
      }

      homeGamesCount[p1.name] = (homeGamesCount[p1.name] || 0) + 1;

      if (p1.name !== "BYE" && p2.name !== "BYE") {
        matches.push({
          id: crypto.randomUUID(),
          divisionId,
          player1: p1.name,
          player2: p2.name,
          score1: null,
          score2: null,
          played: false,
          round: round + 1,
        });
      }
    }

    const first = tempPlayers[0];
    const remaining = tempPlayers.slice(1);
    const last = remaining.pop()!;
    remaining.unshift(last);
    tempPlayers = [first, ...remaining];
  }

  return matches;
};

export const generateCupFixture = (
  divisionId: string,
  players: IPlayer[],
  isCup: boolean,
): IMatch[] => {
  let tempPlayers = [...players];
  const matches: IMatch[] = [];

  if (isCup) {
    tempPlayers = tempPlayers.sort(() => Math.random() - 0.5);
  }

  const count = tempPlayers.length;
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(count)));
  for (let i = count; i < nextPow2; i++) {
    tempPlayers.push({
      ...resetPlayerStats({ name: "BYE" } as IPlayer),
    });
  }

  const totalRounds = Math.log2(nextPow2);
  const roundMatches: IMatch[][] = [];
  let currentRoundSize = nextPow2 / 2;

  for (let r = 0; r < totalRounds; r++) {
    const rMatches: IMatch[] = [];
    for (let m = 0; m < currentRoundSize; m++) {
      rMatches.push({
        id: crypto.randomUUID(),
        divisionId,
        player1: r === 0 ? tempPlayers[m * 2].name : "A definir",
        player2: r === 0 ? tempPlayers[m * 2 + 1].name : "A definir",
        score1: null,
        score2: null,
        played: false,
        round: r + 1,
      });
    }
    roundMatches.push(rMatches);
    currentRoundSize /= 2;
  }

  for (let r = 0; r < totalRounds - 1; r++) {
    const currentRound = roundMatches[r];
    const nextRound = roundMatches[r + 1];

    currentRound.forEach((match, index) => {
      const nextMatchIndex = Math.floor(index / 2);
      const nextMatch = nextRound[nextMatchIndex];

      match.nextMatchId = nextMatch.id;
      match.nextMatchSlot = index % 2 === 0 ? 1 : 2;
    });
  }

  roundMatches.forEach((r) => matches.push(...r));

  matches.forEach((m) => {
    if (m.round === 1) {
      if (m.player2 === "BYE") {
        m.score1 = 1;
        m.score2 = 0;
        m.played = true;
        if (m.nextMatchId && m.nextMatchSlot) {
          const nextM = matches.find((nm) => nm.id === m.nextMatchId);
          if (nextM) {
            if (m.nextMatchSlot === 1) nextM.player1 = m.player1;
            else nextM.player2 = m.player1;
          }
        }
      } else if (m.player1 === "BYE") {
        m.score1 = 0;
        m.score2 = 1;
        m.played = true;
        if (m.nextMatchId && m.nextMatchSlot) {
          const nextM = matches.find((nm) => nm.id === m.nextMatchId);
          if (nextM) {
            if (m.nextMatchSlot === 1) nextM.player1 = m.player2;
            else nextM.player2 = m.player2;
          }
        }
      }
    }
  });

  return matches;
};
