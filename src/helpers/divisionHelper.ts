import { IDivision, IPlayer } from "@/interfaces";

export const addPlayersToDivision = (
  division: IDivision,
  players: IPlayer[],
): IDivision => ({
  ...division,
  players: [...division.players, ...players],
});

export const removePlayerFromDivision = (
  division: IDivision,
  playerName: string,
): IDivision => ({
  ...division,
  players: division.players.filter((p) => p.name !== playerName),
});

export const mergeDivisions = (
  targetDiv: IDivision,
  sourceDiv: IDivision,
): IDivision => ({
  ...targetDiv,
  players: [...targetDiv.players, ...sourceDiv.players],
});
