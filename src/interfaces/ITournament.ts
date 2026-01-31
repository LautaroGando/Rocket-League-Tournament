export interface ITournament {
  id: string;
  name: string;
  date: string;
  type?: string;
  status?: string; // ACTIVE, FINISHED
  champion?: {
    id: string;
    name: string;
  } | null;
  divisions: import("./IDivision").IDivision[];
}
