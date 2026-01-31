import { IPlayer, IDivision } from "@/interfaces";
import { useTournamentStore, useUiStore } from "@/stores";
import { useState } from "react";
import { TournamentType } from "@/enums";
import { createPlayer } from "@/helpers";
import { FixtureList } from "@/components/Tournament/FixtureList";
import { TournamentTable } from "@/components/Home/TournamentTable/TournamentTable";
import { BracketView } from "@/components/Tournament/BracketView";
import { PromotionsPanel } from "@/components/Admin/PromotionsPanel";
import { motion } from "framer-motion";

const DivisionSettings = ({
  division,
  tournamentId,
  onSave,
}: {
  division: IDivision;
  tournamentId: string;
  onSave: (
    tId: string,
    dId: string,
    dp: number,
    pp: number,
    dr: number,
    pr: number,
  ) => void;
}) => {
  const [directProm, setDirectProm] = useState(
    division.directPromotionSpots || 0,
  );
  const [playoffProm, setPlayoffProm] = useState(
    division.playoffPromotionSpots || 0,
  );
  const [directRel, setDirectRel] = useState(
    division.directRelegationSpots || 0,
  );
  const [playoffRel, setPlayoffRel] = useState(
    division.playoffRelegationSpots || 0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 xs:p-6 md:p-8 rounded-4xl border-slate-800/50 mb-12 shadow-2xl space-y-8"
    >
      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg xs:text-xl font-black font-orbitron uppercase tracking-tight">
          Configuración de Tabla{" "}
          <span className="text-slate-500 font-inter font-normal ml-2">
            [{division.name}]
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Ascenso Directo",
            value: directProm,
            setter: setDirectProm,
            color: "text-green-400",
            sub: "(Zona Verde)",
          },
          {
            label: "Play-off de Ascenso",
            value: playoffProm,
            setter: setPlayoffProm,
            color: "text-brand-accent",
            sub: "(Zona Dorada)",
          },
          {
            label: "Play-off de Descenso",
            value: playoffRel,
            setter: setPlayoffRel,
            color: "text-orange-400",
            sub: "(Zona Naranja)",
          },
          {
            label: "Descenso Directo",
            value: directRel,
            setter: setDirectRel,
            color: "text-red-400",
            sub: "(Zona Roja)",
          },
        ].map((item, idx) => (
          <div key={idx} className="space-y-2">
            <label
              className={`text-[10px] font-black uppercase tracking-widest flex flex-col ${item.color}`}
            >
              {item.label}
              <span className="text-[8px] opacity-60 font-bold">
                {item.sub}
              </span>
            </label>
            <input
              type="number"
              value={item.value}
              onChange={(e) => item.setter(Number(e.target.value))}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-black text-center text-lg"
              min={0}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          onSave(
            tournamentId,
            division.id,
            directProm,
            playoffProm,
            directRel,
            playoffRel,
          )
        }
        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black py-4 rounded-2xl transition-all shadow-xl hover:shadow-brand-primary/20 uppercase tracking-widest text-sm"
      >
        Sincronizar Configuración
      </button>
    </motion.div>
  );
};

export const TournamentManagement = ({
  tournamentId,
}: {
  tournamentId: string;
}) => {
  const {
    tournaments,
    setActiveTournament,
    generateFixture,
    addDivision,
    addPlayersToDivision,
    updateDivisionSettings,
    removePlayer,
    deleteDivision,
    createPlayoffsDivision,
    updateTournamentName,
    updateDivisionName,
    updatePlayerName,
  } = useTournamentStore();
  const { showPrompt, showConfirm } = useUiStore();

  const [newPlayersInput, setNewPlayersInput] = useState("");
  const tournament = tournaments.find((t) => t.id === tournamentId);

  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(
    () => tournament?.divisions[0]?.id || null,
  );

  const activeDivision = selectedDivisionId
    ? tournament?.divisions.find((d) => d.id === selectedDivisionId) ||
      tournament?.divisions[0]
    : tournament?.divisions[0];

  if (!tournament)
    return (
      <div className="p-8 text-center glass-panel m-10 rounded-3xl">
        <p className="text-slate-400 font-bold uppercase tracking-widest">
          Registro de torneo no identificado
        </p>
      </div>
    );

  const handleAddDivision = async () => {
    const name = await showPrompt(
      "Nueva División",
      "Ingresa el nombre (ej: Liga Pro, División B):",
    );
    if (name) {
      addDivision(tournament.id, name);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 xs:p-8 md:p-12 bg-[#030712] min-h-screen text-slate-100 font-inter"
    >
      <button
        onClick={() => setActiveTournament("")}
        className="mb-10 text-slate-500 hover:text-white flex items-center gap-2 group transition-colors font-black text-[10px] uppercase tracking-[0.3em]"
      >
        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 group-hover:border-slate-700">
          ←
        </span>
        Volver al Panel
      </button>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-4xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 text-brand-primary shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <div className="group flex items-center gap-4">
            <div>
              <h1 className="text-2xl xs:text-3xl md:text-4xl font-black text-glow font-orbitron uppercase tracking-tighter">
                {tournament.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                  Supervisión Operativa
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                const newName = await showPrompt(
                  "Actualizar Etiqueta",
                  "Ingresa el nuevo nombre del torneo:",
                  tournament.name,
                );
                if (newName && newName !== tournament.name) {
                  updateTournamentName(tournament.id, newName);
                }
              }}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-brand-primary opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all shadow-xl"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 w-full xl:w-auto">
          {activeDivision && activeDivision.matches.length === 0 && (
            <button
              onClick={() => generateFixture(tournament.id, activeDivision.id)}
              className="flex-1 xl:flex-none bg-green-500 hover:bg-green-400 text-white font-black py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all uppercase tracking-widest text-xs"
            >
              Inicializar Fixture
            </button>
          )}
          {tournament.type === TournamentType.CHAMPIONS &&
            !tournament.divisions.some((d) => d.name === "Fase Final") && (
              <button
                onClick={async () => {
                  const spots =
                    tournament.divisions[0]?.directPromotionSpots || 2;
                  createPlayoffsDivision(tournament.id, spots);
                }}
                className="flex-1 xl:flex-none bg-brand-accent hover:bg-amber-400 text-white font-black py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all uppercase tracking-widest text-xs"
              >
                Desplegar Playoffs
              </button>
            )}

          {tournament.type === TournamentType.LEAGUE && (
            <button
              onClick={handleAddDivision}
              className="flex-1 xl:flex-none bg-brand-primary hover:bg-blue-400 text-white font-black py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all uppercase tracking-widest text-xs"
            >
              Nueva División
            </button>
          )}

          {tournament.status !== "FINISHED" ? (
            <button
              onClick={async () => {
                const confirmed = await showConfirm(
                  "Sellar Registros",
                  "¿Finalizar torneo y Rankings? Esto no se puede deshacer.",
                );
                if (confirmed) {
                  useTournamentStore.getState().finishTournament(tournament.id);
                }
              }}
              className="flex-1 xl:flex-none bg-red-500/20 text-red-400 hover:bg-red-500/30 font-black py-3 px-8 rounded-xl border border-red-500/30 transition-all uppercase tracking-widest text-xs"
            >
              Finalizar
            </button>
          ) : (
            <div className="bg-yellow-500/10 text-yellow-500 px-8 py-3 rounded-xl border border-yellow-500/20 font-black uppercase tracking-widest text-xs">
              Registro Histórico
            </div>
          )}
        </div>
      </div>

      {/* Division Tabs */}
      <div className="flex gap-2 bg-slate-950/40 p-1.5 rounded-2xl border border-slate-900 mb-10 overflow-x-auto no-scrollbar max-w-full">
        {tournament.divisions.map((div) => (
          <div
            key={div.id}
            className={`flex items-center gap-1 group relative ${
              activeDivision?.id === div.id
                ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                : "text-slate-500 hover:text-slate-200 border-transparent hover:bg-slate-900/40"
            } px-4 py-2.5 rounded-xl border transition-all cursor-pointer`}
            onClick={() => setSelectedDivisionId(div.id)}
          >
            <span className="font-black uppercase tracking-widest text-[10px] whitespace-nowrap px-2">
              {div.name}
            </span>

            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const newName = await showPrompt(
                    "Actualizar Título",
                    "Nuevo nombre de división:",
                    div.name,
                  );
                  if (newName && newName !== div.name) {
                    updateDivisionName(div.id, newName);
                  }
                }}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-brand-primary/20 hover:text-brand-primary"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const confirmed = await showConfirm(
                    "Desmontar División",
                    "Esta acción borra todos los datos. ¿Sincronizar eliminación?",
                  );
                  if (confirmed) {
                    deleteDivision(tournament.id, div.id);
                  }
                }}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeDivision &&
        tournament.type === TournamentType.LEAGUE &&
        !activeDivision.name.startsWith("Promoción") && (
          <DivisionSettings
            key={activeDivision.id}
            division={activeDivision}
            tournamentId={tournament.id}
            onSave={updateDivisionSettings}
          />
        )}

      {activeDivision && activeDivision.matches.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-4 xs:p-6 md:p-8 rounded-4xl border-slate-800/50 mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/20 flex items-center justify-center text-brand-accent">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h3 className="text-lg xs:text-xl font-black font-orbitron uppercase tracking-tight">
              Poblar Roster{" "}
              <span className="text-slate-500 font-inter font-normal ml-2">
                [{activeDivision.name}]
              </span>
            </h3>
          </div>

          <div className="space-y-6">
            <textarea
              value={newPlayersInput}
              onChange={(e) => setNewPlayersInput(e.target.value)}
              className="w-full bg-slate-900/50 rounded-2xl p-6 h-40 border border-slate-800 focus:border-brand-primary transition-all outline-none resize-none custom-scrollbar font-medium"
              placeholder="Ingresa nombres (uno por fila)&#10;Ex: Octane-Main&#10;WhiffMaster&#10;Shadow-RL"
            />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (!newPlayersInput.trim()) return;

                  const playersList: IPlayer[] = newPlayersInput
                    .split("\n")
                    .filter((p) => p.trim() !== "")
                    .map((name) => createPlayer(name.trim()));

                  addPlayersToDivision(
                    tournament.id,
                    activeDivision.id,
                    playersList,
                  );
                  setNewPlayersInput("");
                }}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl hover:shadow-brand-primary/20 uppercase tracking-widest text-sm"
              >
                Incorporar Jugadores
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeDivision ? (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-10">
          {!activeDivision.name.startsWith("Promoción") && (
            <div className="space-y-6">
              <div className="glass-panel p-4 xs:p-6 md:p-8 rounded-4xl border-slate-800/50 h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-brand-secondary/20 flex items-center justify-center text-brand-secondary">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg xs:text-xl font-black font-orbitron uppercase tracking-tight">
                    {tournament.type === "CUP" ||
                    (tournament.type === "CHAMPIONS" &&
                      activeDivision.name === "Fase Final")
                      ? "Grilla de Combate Directo"
                      : "Rankings en Vivo"}
                  </h3>
                </div>

                {tournament.type === TournamentType.CUP ||
                (tournament.type === TournamentType.CHAMPIONS &&
                  activeDivision.name === "Fase Final") ? (
                  <BracketView matches={activeDivision.matches} />
                ) : (
                  <div className="-mx-4 md:-mx-8">
                    <TournamentTable
                      data={activeDivision.players}
                      config={{
                        directProm: activeDivision.directPromotionSpots,
                        playoffProm: activeDivision.playoffPromotionSpots,
                        directRel: activeDivision.directRelegationSpots,
                        playoffRel: activeDivision.playoffRelegationSpots,
                      }}
                      onDeletePlayer={(playerName) =>
                        removePlayer(
                          tournament.id,
                          activeDivision.id,
                          playerName,
                        )
                      }
                      onEditPlayer={async (oldName) => {
                        const newName = await showPrompt(
                          "Actualizar Identidad",
                          "Nuevo nombre de jugador:",
                          oldName,
                        );
                        if (newName && newName !== oldName) {
                          updatePlayerName(activeDivision.id, oldName, newName);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <FixtureList
              key={activeDivision.id}
              tournamentId={tournament.id}
              divisionId={activeDivision.id}
              matches={activeDivision.matches}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-20 glass-panel rounded-4xl border-dashed border-slate-800">
          <span className="text-5xl mb-6 block grayscale">🗄️</span>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">
            No se identificaron archivos de datos
          </p>
          <p className="text-slate-600 font-medium text-[10px] uppercase tracking-widest">
            Inicializa una división para comenzar el seguimiento
          </p>
        </div>
      )}

      {tournament.type === TournamentType.LEAGUE && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <PromotionsPanel tournament={tournament} />
        </motion.div>
      )}
    </motion.div>
  );
};
