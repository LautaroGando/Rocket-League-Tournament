import { ITournament, IDivision, IPlayer, IMatch } from "@/interfaces";
import { resetPlayerStats } from "./playerHelper";

export const resolvePromotions = (
  tournament: ITournament,
  nextDivisions: IDivision[],
): { player: string; from: string; to: string }[] => {
  const moves: { player: string; from: string; to: string }[] = [];

  const regularDivisions = tournament.divisions.filter(
    (d) => !d.name.startsWith("Promoción"),
  );

  const sortFn = (a: IPlayer, b: IPlayer) =>
    b.points - a.points || b.goalDifference - a.goalDifference;

  // Direct moves
  for (let i = 0; i < regularDivisions.length - 1; i++) {
    const highDiv = regularDivisions[i];
    const lowDiv = regularDivisions[i + 1];

    const sortedHigh = [...highDiv.players].sort(sortFn);
    const sortedLow = [...lowDiv.players].sort(sortFn);

    const directRel = highDiv.directRelegationSpots || 0;
    const directProm = lowDiv.directPromotionSpots || 0;

    const relegators = sortedHigh.slice(
      Math.max(0, sortedHigh.length - directRel),
    );
    relegators.forEach((p) =>
      moves.push({ player: p.name, from: highDiv.id, to: lowDiv.id }),
    );

    const promoters = sortedLow.slice(0, directProm);
    promoters.forEach((p) =>
      moves.push({ player: p.name, from: lowDiv.id, to: highDiv.id }),
    );
  }

  // Promo match moves
  const promoDivisions = tournament.divisions.filter((d) =>
    d.name.startsWith("Promoción"),
  );

  promoDivisions.forEach((promo) => {
    promo.matches.forEach((m) => {
      if (!m.score1 && m.score1 !== 0) return;
      if (!m.score2 && m.score2 !== 0) return;

      const p1Name = m.player1;
      const p2Name = m.player2;
      const s1 = m.score1 ?? -1;
      const s2 = m.score2 ?? -1;

      const winnerName = s1 > s2 ? p1Name : s2 > s1 ? p2Name : null;
      if (!winnerName) return;

      let p1DivId = "";
      let p2DivId = "";

      for (const d of nextDivisions) {
        if (d.players.find((p) => p.name === p1Name)) p1DivId = d.id;
        if (d.players.find((p) => p.name === p2Name)) p2DivId = d.id;
      }

      if (!p1DivId || !p2DivId) return;
      if (p1DivId === p2DivId) return;

      const divIndex1 = nextDivisions.findIndex((d) => d.id === p1DivId);
      const divIndex2 = nextDivisions.findIndex((d) => d.id === p2DivId);

      const highDivIndex = Math.min(divIndex1, divIndex2);
      const lowDivIndex = Math.max(divIndex1, divIndex2);

      const highPlayerName = divIndex1 === highDivIndex ? p1Name : p2Name;
      const lowPlayerName = divIndex1 === highDivIndex ? p2Name : p1Name;

      if (winnerName === lowPlayerName) {
        moves.push({
          player: lowPlayerName,
          from: nextDivisions[lowDivIndex].id,
          to: nextDivisions[highDivIndex].id,
        });
        moves.push({
          player: highPlayerName,
          from: nextDivisions[highDivIndex].id,
          to: nextDivisions[lowDivIndex].id,
        });
      }
    });
  });

  return moves;
};

export const executeMoves = (
  nextDivisions: IDivision[],
  moves: { player: string; from: string; to: string }[],
): void => {
  const playersToMove: Record<string, IPlayer> = {};

  moves.forEach((move) => {
    const div = nextDivisions.find((d) => d.id === move.from);
    if (div) {
      const pIndex = div.players.findIndex((p) => p.name === move.player);
      if (pIndex !== -1) {
        playersToMove[move.player] = div.players[pIndex];
        div.players.splice(pIndex, 1);
      }
    }
  });

  moves.forEach((move) => {
    const player = playersToMove[move.player];
    if (player) {
      const div = nextDivisions.find((d) => d.id === move.to);
      if (div) {
        div.players.push(player);
      }
    }
  });
};
