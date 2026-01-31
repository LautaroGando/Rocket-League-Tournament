import { IPlayer } from "@/interfaces";
import { ColumnDef } from "@tanstack/react-table";

export const tournamentColumns: ColumnDef<IPlayer>[] = [
  {
    id: "position",
    header: "#",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span
          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black ${
            row.index === 0
              ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
              : row.index === 1
                ? "bg-slate-300/20 text-slate-300 border border-slate-300/50"
                : row.index === 2
                  ? "bg-amber-700/20 text-amber-700 border border-amber-700/50"
                  : "bg-slate-800/50 text-slate-500 border border-slate-700/50"
          }`}
        >
          {row.index + 1}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Jugador",
    cell: (info) => (
      <span className="font-bold text-slate-100 tracking-wide text-left block pl-2">
        {info.getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "points",
    header: "Pts",
    cell: (info) => (
      <span className="font-black text-brand-primary text-lg">
        {info.getValue<number>()}
      </span>
    ),
  },
  {
    accessorKey: "gamesPlayed",
    header: "PJ",
  },
  {
    accessorKey: "matchesWon",
    header: "PG",
  },
  {
    accessorKey: "matchesTied",
    header: "PE",
  },
  {
    accessorKey: "matchesLost",
    header: "PP",
  },
  {
    accessorKey: "extraTimeGames",
    header: "TE",
    cell: (info) => (
      <span className="text-brand-secondary font-bold">
        {info.getValue<number>()}
      </span>
    ),
  },
  {
    accessorKey: "goalsInFavor",
    header: "GF",
  },
  {
    accessorKey: "goalsAgainst",
    header: "GC",
  },
  {
    accessorKey: "goalDifference",
    header: "Dif",
    cell: (info) => {
      const value = info.getValue<number>();
      return (
        <span
          className={`font-bold ${value > 0 ? "text-brand-accent" : value < 0 ? "text-red-400" : "text-slate-500"}`}
        >
          {value > 0 ? `+${value}` : value}
        </span>
      );
    },
  },
  {
    accessorKey: "pointsInMatch",
    header: "Pts Juego",
  },
  {
    accessorKey: "shooting",
    header: "Tiros",
  },
  {
    accessorKey: "saved",
    header: "Salvadas",
  },
];
