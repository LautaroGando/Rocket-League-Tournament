import { IPlayer } from "./IPlayer";
import { IMatch } from "./IMatch";

export interface IDivision {
  id: string;
  name: string;
  players: IPlayer[];
  matches: IMatch[];
  // Configuration for Table Coloring / Logic
  directPromotionSpots?: number;
  playoffPromotionSpots?: number;
  directRelegationSpots?: number;
  playoffRelegationSpots?: number;
}
