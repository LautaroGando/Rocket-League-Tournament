"use client";

import { IPlayer } from "@/interfaces";
import { TournamentType } from "@/enums";
import { useTournamentStore, useUiStore } from "@/stores";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TournamentManagement } from "./TournamentManagement";

export const AdminPanel = () => {
  const {
    tournaments,
    createTournament,
    deleteTournament,
    setActiveTournament,
    activeTournamentId,
    addDivision,
    addPlayersToDivision,
    loadTournaments,
  } = useTournamentStore();
  const { showAlert, showConfirm } = useUiStore();

  const [newTournamentName, setNewTournamentName] = useState("");
  const [initialDivisionName, setInitialDivisionName] = useState("");
  const [initialPlayers, setInitialPlayers] = useState<string>("");
  const [tournamentType, setTournamentType] = useState<TournamentType>(
    TournamentType.LEAGUE,
  );
  const [numberOfGroups, setNumberOfGroups] = useState(2);

  // Auth State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Adding a small delay to avoid "setState synchronously within an effect" warning
    // and ensuring smooth client-side hydration
    const timeout = setTimeout(() => {
      const auth = localStorage.getItem("admin_auth") === "true";
      setIsAuthenticated(auth);
      setIsCheckingAuth(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  // Load Data
  useEffect(() => {
    if (isAuthenticated) {
      loadTournaments();

      const interval = setInterval(() => {
        loadTournaments();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loadTournaments]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      email === "lautarogandodev@gmail.com" &&
      password === "RocketLeague*3"
    ) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      setError("");
    } else {
      setError("Credenciales incorrectas");
    }
  };

  const handleCreate = async () => {
    if (!newTournamentName) return;

    const playersList: IPlayer[] = initialPlayers
      .split("\n")
      .filter((p) => p.trim() !== "")
      .map((name) => ({
        name: name.trim(),
        points: 0,
        gamesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        matchesTied: 0,
        extraTimeGames: 0,
        goalsInFavor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        pointsInMatch: 0,
        shooting: 0,
        saved: 0,
      }));

    if (tournamentType === TournamentType.CHAMPIONS) {
      const groupsCount = parseInt(numberOfGroups.toString());
      if (isNaN(groupsCount) || groupsCount < 2) {
        await showAlert("Error", "Debes crear al menos 2 grupos.");
        return;
      }

      const playersPerGroup = Math.ceil(playersList.length / groupsCount);
      const outputGroups: IPlayer[][] = [];

      for (let i = 0; i < groupsCount; i++) {
        outputGroups.push(
          playersList.slice(i * playersPerGroup, (i + 1) * playersPerGroup),
        );
      }

      const groupA = outputGroups[0];
      const newId = await createTournament(
        newTournamentName,
        groupA,
        "Grupo A",
        TournamentType.CHAMPIONS,
      );

      if (newId) {
        for (let i = 1; i < groupsCount; i++) {
          const groupName = `Grupo ${String.fromCharCode(65 + i)}`;
          const newDivId = await addDivision(newId, groupName);
          if (newDivId) {
            await addPlayersToDivision(newId, newDivId, outputGroups[i]);
          }
        }
      }
    } else {
      await createTournament(
        newTournamentName,
        playersList,
        initialDivisionName || "Clasificación",
        tournamentType,
      );
    }

    setNewTournamentName("");
    setInitialDivisionName("");
    setInitialPlayers("");
    setTournamentType(TournamentType.LEAGUE);
    setNumberOfGroups(2);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm(
      "¿Eliminar Torneo?",
      "¿Estás seguro de que quieres eliminar este torneo? Esta acción no se puede deshacer.",
    );
    if (confirmed) {
      deleteTournament(id);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#030712] flex items-center justify-center p-4 md:p-6 relative overflow-hidden"
      >
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 xs:p-8 md:p-10 rounded-4xl w-full max-w-md border-white/5 relative z-10 shadow-2xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-2xl xs:text-3xl md:text-4xl font-black text-glow font-orbitron uppercase tracking-tighter mb-2">
              Acceso Admin
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Solo Personal Autorizado
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 text-white border border-slate-700/50 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all placeholder:text-slate-700"
                placeholder="admin@rl-tournament.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">
                Contraseña Segura
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 text-white border border-slate-700/50 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all placeholder:text-slate-700"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-400 text-center text-xs font-bold bg-red-400/10 py-2 rounded-lg border border-red-400/20"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm"
            >
              Autenticar
            </button>
          </form>
        </motion.div>
      </motion.div>
    );
  }

  if (activeTournamentId) {
    return <TournamentManagement tournamentId={activeTournamentId} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 xs:p-8 md:p-12 bg-[#030712] min-h-screen text-slate-100 font-inter"
    >
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
        <div>
          <h1 className="text-2xl xs:text-3xl md:text-4xl font-black text-glow font-orbitron uppercase tracking-tighter mb-2">
            Centro de Control
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Sistema Operativo
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setIsAuthenticated(false);
            localStorage.removeItem("admin_auth");
          }}
          className="px-6 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all font-bold text-xs uppercase tracking-widest"
        >
          Cerrar Sesión
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
        {/* Creation Section */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 xs:p-8 md:p-10 rounded-4xl border-slate-800/50 shadow-2xl space-y-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black font-orbitron uppercase tracking-tight">
              Crear Torneo
            </h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Nombre del Torneo
              </label>
              <input
                type="text"
                value={newTournamentName}
                onChange={(e) => setNewTournamentName(e.target.value)}
                className="w-full bg-slate-950/50 rounded-2xl px-5 py-4 border border-slate-800 focus:border-brand-primary transition-all outline-none"
                placeholder="Liga Master 2026"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Formato de Juego
              </label>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: TournamentType.LEAGUE, label: "Liga", icon: "🏆" },
                  { id: TournamentType.CUP, label: "Copa", icon: "⚔️" },
                  { id: TournamentType.CHAMPIONS, label: "Grupos", icon: "🛡️" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setTournamentType(type.id)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${
                      tournamentType === type.id
                        ? "bg-brand-primary/20 border-brand-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                        : "bg-slate-950/30 border-slate-800 text-slate-500 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {tournamentType === TournamentType.CHAMPIONS ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Cantidad de Grupos
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={1}
                    value={numberOfGroups}
                    onChange={(e) =>
                      setNumberOfGroups(parseInt(e.target.value))
                    }
                    className="flex-1 accent-brand-primary h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 font-black text-brand-primary">
                    {numberOfGroups}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Nombre de División
                </label>
                <input
                  type="text"
                  value={initialDivisionName}
                  onChange={(e) => setInitialDivisionName(e.target.value)}
                  className="w-full bg-slate-950/50 rounded-2xl px-5 py-4 border border-slate-800 focus:border-brand-primary transition-all outline-none"
                  placeholder="Clasificación A (Opcional)"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Lista de Jugadores (Uno por línea)
              </label>
              <textarea
                value={initialPlayers}
                onChange={(e) => setInitialPlayers(e.target.value)}
                className="w-full bg-slate-950/50 rounded-2xl px-5 py-4 h-40 border border-slate-800 focus:border-brand-primary transition-all outline-none resize-none custom-scrollbar"
                placeholder="Rogue&#10;Wraith&#10;Valkyrie"
              />
            </div>

            <button
              onClick={handleCreate}
              className="w-full text-white font-black py-4 px-6 rounded-2xl transition-all shadow-xl hover:shadow-brand-primary/20 bg-linear-to-r from-brand-primary to-brand-secondary uppercase tracking-[0.2em] text-sm hover:scale-[1.01] active:scale-[0.99]"
            >
              Desplegar Torneo
            </button>
          </div>
        </motion.div>

        {/* List Section */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-secondary/20 flex items-center justify-center text-brand-secondary">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black font-orbitron uppercase tracking-tight">
              Archivos Activos
            </h2>
          </div>

          {tournaments.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-4xl border-dashed border-slate-800">
              <span className="text-5xl mb-6 block grayscale">🏆</span>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Sin Registros de Torneos
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[850px] overflow-y-auto pr-3 custom-scrollbar">
              {tournaments.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ x: 4 }}
                  className="group relative glass-panel border-slate-800 p-4 xs:p-6 rounded-4xl hover:border-brand-primary/50 transition-all hover:bg-slate-800/20"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-black text-lg xs:text-xl text-white group-hover:text-brand-primary transition-colors uppercase tracking-tight">
                          {t.name}
                        </span>
                        {t.status === "FINISHED" ? (
                          <span className="bg-yellow-500/10 text-yellow-500 text-[9px] font-black px-2.5 py-1 rounded-full border border-yellow-500/20 uppercase tracking-widest">
                            Archivado
                          </span>
                        ) : (
                          <span className="bg-brand-accent/10 text-brand-accent text-[9px] font-black px-2.5 py-1 rounded-full border border-brand-accent/20 uppercase tracking-widest">
                            En Vivo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(t.date).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-brand-secondary">
                          {t.type === "LEAGUE"
                            ? "LIGA"
                            : t.type === "CUP"
                              ? "COPA"
                              : "CHAMPIONS"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button
                        onClick={() => setActiveTournament(t.id)}
                        className="flex-1 md:flex-none bg-slate-900 border border-slate-700 hover:border-brand-primary hover:text-white text-slate-400 font-black py-3 px-6 rounded-xl text-xs transition-all uppercase tracking-widest"
                      >
                        Administrar
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-600 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 transition-all"
                        title="Eliminar Permanentemente"
                      >
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
