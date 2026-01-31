"use client";

import { useTournamentStore } from "@/stores";
import { TournamentTable } from "../TournamentTable/TournamentTable";
import { FixtureList } from "../../Tournament/FixtureList";
import { BracketView } from "../../Tournament/BracketView";
import { TrophyRoom } from "../TrophyRoom/TrophyRoom";
import { motion } from "framer-motion";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

export const Tables = () => {
  const { tournaments, activeTournamentId, isLoading } = useTournamentStore();
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    string | null
  >(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(
    null,
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        <div className="text-center glass-card p-12 rounded-2xl neon-border">
          <h1 className="text-5xl font-extrabold mb-6 text-glow">Bienvenido</h1>
          <p className="text-slate-400 text-lg mb-8">
            No hay torneos activos aún.
          </p>
          <a
            href="/admin"
            className="px-8 py-4 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/80 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            Configurar Torneo
          </a>
        </div>
      </div>
    );
  }

  const displayedTournamentId =
    selectedTournamentId ||
    activeTournamentId ||
    (tournaments.length > 0 ? tournaments[0].id : null);

  const displayedTournament = displayedTournamentId
    ? tournaments.find((t) => t.id === displayedTournamentId)
    : null;

  if (!displayedTournament) return null;

  const activeDivision = selectedDivisionId
    ? displayedTournament.divisions.find((d) => d.id === selectedDivisionId) ||
      displayedTournament.divisions[0]
    : displayedTournament.divisions[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-3 xs:p-6 md:p-10 max-w-[1600px] mx-auto"
    >
      <header className="mb-12 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl xs:text-5xl md:text-7xl font-black uppercase text-glow mb-2 wrap-break-word leading-tight">
                {displayedTournament.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="h-px w-12 bg-brand-primary"></span>
                <p className="text-brand-accent font-orbitron text-sm uppercase tracking-[0.2em]">
                  Temporada Oficial •{" "}
                  {displayedTournament.type === "LEAGUE"
                    ? "LIGA"
                    : displayedTournament.type === "CUP"
                      ? "COPA"
                      : "CHAMPIONS"}
                </p>
              </div>
            </motion.div>
          </div>

          {tournaments.length > 1 && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative group cursor-pointer"
            >
              <select
                value={selectedTournamentId || ""}
                onChange={(e) => {
                  setSelectedTournamentId(e.target.value);
                  setSelectedDivisionId(null);
                }}
                className="appearance-none bg-slate-900/80 border border-slate-700 text-slate-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all cursor-pointer pr-12 min-w-[240px] font-medium"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Modern Division Tabs */}
      {displayedTournament.divisions.length > 0 && (
        <nav className="mb-12 flex items-center gap-2 p-1.5 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl w-full overflow-x-auto no-scrollbar">
          {displayedTournament.divisions.map((div) => {
            const isActive = activeDivision.id === div.id;
            return (
              <button
                key={div.id}
                onClick={() => setSelectedDivisionId(div.id)}
                className={`relative px-4 xs:px-8 py-3 rounded-xl font-bold transition-all duration-300 text-xs xs:text-sm md:text-base uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-brand-primary shadow-[0_0_20px_rgba(59,130,246,0.3)] rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{div.name}</span>
              </button>
            );
          })}
        </nav>
      )}

      {activeDivision ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-8 space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl xs:text-3xl font-black uppercase tracking-tight flex items-center gap-4">
                <span className="w-2 h-8 bg-brand-primary rounded-full"></span>
                {displayedTournament.type === "CUP" ||
                (displayedTournament.type === "CHAMPIONS" &&
                  activeDivision.name === "Fase Final")
                  ? "Cuadro"
                  : "Clasificación"}
              </h2>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-inner">
              {displayedTournament.type === "CUP" ||
              (displayedTournament.type === "CHAMPIONS" &&
                activeDivision.name === "Fase Final") ? (
                <div className="p-4 xs:p-8 overflow-x-auto min-h-[400px] flex items-center justify-center">
                  <BracketView matches={activeDivision.matches} />
                </div>
              ) : (
                <TournamentTable
                  data={activeDivision.players}
                  config={{
                    directProm: activeDivision.directPromotionSpots,
                    playoffProm: activeDivision.playoffPromotionSpots,
                    directRel: activeDivision.directRelegationSpots,
                    playoffRel: activeDivision.playoffRelegationSpots,
                  }}
                />
              )}
            </div>
          </motion.section>

          <motion.aside
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="xl:col-span-4 space-y-8"
          >
            <h2 className="text-xl xs:text-3xl font-black uppercase tracking-tight flex items-center gap-4">
              <span className="w-2 h-8 bg-brand-secondary rounded-full"></span>
              Próximos Encuentros
            </h2>
            <div className="glass-panel rounded-3xl p-6 border-slate-800/50 shadow-2xl">
              <FixtureList
                tournamentId={displayedTournament.id}
                divisionId={activeDivision.id}
                matches={activeDivision.matches}
                readOnly={true}
              />
            </div>
          </motion.aside>
        </div>
      ) : (
        <div className="text-center p-8 xs:p-20 glass-card rounded-3xl max-w-2xl mx-auto neon-border">
          <p className="text-slate-300 text-xl font-medium mb-2">
            Configuración pendiente
          </p>
          <p className="text-slate-500">
            Aún no se han definido divisiones para este torneo.
          </p>
        </div>
      )}

      <footer className="mt-20">
        <TrophyRoom />
      </footer>

      {/* WhatsApp Registration Button */}
      <a
        href="https://wa.me/5491132692245?text=Hola,%20quisiera%20inscribirme%20al%20torneo%20de%20Rocket%20League%20🚀"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20b858] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
        title="Inscribirse al Torneo"
      >
        <MessageCircle className="w-8 h-8 filter drop-shadow-lg" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap ml-0 group-hover:ml-3 font-bold text-lg">
          Inscribirse
        </span>
      </a>
    </motion.div>
  );
};
