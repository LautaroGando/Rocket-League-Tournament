import { IPlayer } from "@/interfaces";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  Row,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useUiStore } from "@/stores/useUiStore";
import { tournamentColumns } from "./columns";

interface Props {
  data: IPlayer[];
  config?: {
    directProm?: number;
    playoffProm?: number;
    directRel?: number;
    playoffRel?: number;
  };
  onDeletePlayer?: (playerName: string) => void;
  onEditPlayer?: (playerName: string) => void;
}

export const TournamentTable = ({
  data,
  config = {},
  onDeletePlayer,
  onEditPlayer,
}: Props) => {
  const { showConfirm } = useUiStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo(() => {
    if (!onDeletePlayer && !onEditPlayer) return tournamentColumns;
    return [
      ...tournamentColumns,
      {
        id: "actions",
        header: "Acción",
        cell: ({ row }: { row: Row<IPlayer> }) => (
          <div className="flex gap-2 justify-center">
            {onEditPlayer && (
              <button
                onClick={() => onEditPlayer(row.original.name)}
                className="text-blue-500 hover:text-blue-400 font-bold"
                title="Editar nombre"
              >
                ✏️
              </button>
            )}
            {onDeletePlayer && (
              <button
                onClick={async () => {
                  const confirmed = await showConfirm(
                    "Eliminar Jugador",
                    `¿Eliminar al jugador ${row.original.name}?`,
                  );
                  if (confirmed) onDeletePlayer(row.original.name);
                }}
                className="text-red-500 hover:text-red-400 font-bold"
                title="Eliminar jugador"
              >
                ❌
              </button>
            )}
          </div>
        ),
      },
    ];
  }, [onDeletePlayer, onEditPlayer, showConfirm]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const getRowClass = (index: number, total: number) => {
    const {
      directProm = 0,
      playoffProm = 0,
      directRel = 0,
      playoffRel = 0,
    } = config;

    // Promotion Zone
    if (index < directProm) return "bg-green-500/10 hover:bg-green-500/20";
    if (index < directProm + playoffProm)
      return "bg-brand-accent/10 hover:bg-brand-accent/20";

    // Relegation Zone
    const relegationStartIndex = total - directRel;
    const playoffRelStartIndex = total - directRel - playoffRel;

    if (index >= relegationStartIndex)
      return "bg-red-500/10 hover:bg-red-500/20";
    if (index >= playoffRelStartIndex)
      return "bg-orange-500/10 hover:bg-orange-500/20";

    return "hover:bg-white/5";
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="min-w-[500px] w-full text-sm text-center border-separate border-spacing-y-1.5 px-2 xs:px-4 md:px-8">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="p-4 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:text-slate-200 transition-colors"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center justify-center gap-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    <span className="text-[10px] opacity-30">
                      {header.column.getIsSorted() === "asc"
                        ? "▲"
                        : header.column.getIsSorted() === "desc"
                          ? "▼"
                          : ""}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="font-medium">
          {table.getRowModel().rows.map((row, i) => (
            <motion.tr
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.03 + 0.5 }}
              key={row.id}
              className={`group rounded-2xl transition-all duration-300 ${getRowClass(i, data.length)}`}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="py-4 px-2 first:rounded-l-2xl last:rounded-r-2xl"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
