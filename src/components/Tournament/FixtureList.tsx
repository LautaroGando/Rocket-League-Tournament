"use client";

import { useTournamentStore } from "@/stores";
import { IMatch } from "@/interfaces";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  tournamentId: string;
  divisionId: string;
  matches: IMatch[];
  readOnly?: boolean;
}

export const FixtureList = ({
  tournamentId,
  divisionId,
  matches,
  readOnly = false,
}: Props) => {
  const { updateMatch } = useTournamentStore();
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [expandedRounds, setExpandedRounds] = useState<number[]>([1]);
  const [scores, setScores] = useState<{
    [key: string]: {
      s1: string;
      s2: string;
      isOvertime: boolean;
      p1Shots: string;
      p1Saves: string;
      p1Points: string;
      p2Shots: string;
      p2Saves: string;
      p2Points: string;
      date: string;
      postponed: boolean;
    };
  }>({});

  const handleEditClick = (match: IMatch) => {
    setEditingMatchId(match.id);
    const scheduledDate = match.scheduledDate
      ? new Date(match.scheduledDate).toISOString().slice(0, 16)
      : "";

    setScores({
      ...scores,
      [match.id]: {
        s1: match.score1?.toString() || "",
        s2: match.score2?.toString() || "",
        isOvertime: match.isOvertime || false,
        p1Shots: match.player1Stats?.shots.toString() || "0",
        p1Saves: match.player1Stats?.saves.toString() || "0",
        p1Points: match.player1Stats?.pointsInMatch.toString() || "0",
        p2Shots: match.player2Stats?.shots.toString() || "0",
        p2Saves: match.player2Stats?.saves.toString() || "0",
        p2Points: match.player2Stats?.pointsInMatch.toString() || "0",
        date: scheduledDate,
        postponed: match.postponed || false,
      },
    });
  };

  const handleSave = (matchId: string) => {
    const s1 = parseInt(scores[matchId]?.s1 || "");
    const s2 = parseInt(scores[matchId]?.s2 || "");
    const isOvertime = scores[matchId]?.isOvertime || false;
    const scheduledDateStr = scores[matchId]?.date;
    const scheduledDate = scheduledDateStr
      ? new Date(scheduledDateStr)
      : undefined;
    const postponed = scores[matchId]?.postponed || false;

    // Stats
    const p1Stats = {
      shots: parseInt(scores[matchId]?.p1Shots || "0"),
      saves: parseInt(scores[matchId]?.p1Saves || "0"),
      pointsInMatch: parseInt(scores[matchId]?.p1Points || "0"),
    };
    const p2Stats = {
      shots: parseInt(scores[matchId]?.p2Shots || "0"),
      saves: parseInt(scores[matchId]?.p2Saves || "0"),
      pointsInMatch: parseInt(scores[matchId]?.p2Points || "0"),
    };

    if (editingMatchId) {
      updateMatch(
        tournamentId,
        divisionId,
        matchId,
        isNaN(s1) ? 0 : s1,
        isNaN(s2) ? 0 : s2,
        isOvertime,
        p1Stats,
        p2Stats,
        scheduledDate,
        postponed,
      );
      setEditingMatchId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sin Horario";
    const date = new Date(dateString);
    return date.toLocaleString("es-AR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupedByRound = matches.reduce(
    (acc, match) => {
      const r = match.round;
      if (!acc[r]) acc[r] = [];
      acc[r].push(match);
      return acc;
    },
    {} as { [key: number]: IMatch[] },
  );

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-blue-400 font-orbitron">
        Fixture
      </h3>
      {Object.entries(groupedByRound).map(([round, roundMatches], rIdx) => {
        const isExpanded = expandedRounds.includes(Number(round));
        return (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: rIdx * 0.1 }}
            key={round}
            className="glass-panel rounded-3xl overflow-hidden border-slate-800/50 mb-6"
          >
            <button
              onClick={() => {
                const rNum = Number(round);
                setExpandedRounds((prev) =>
                  prev.includes(rNum)
                    ? prev.filter((r) => r !== rNum)
                    : [...prev, rNum],
                );
              }}
              className="w-full flex items-center justify-between p-5 cursor-pointer bg-slate-900/40 hover:bg-slate-800/40 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-secondary/20 text-brand-secondary font-black border border-brand-secondary/30">
                  {round}
                </div>
                <h4 className="text-xl font-black uppercase tracking-widest text-slate-100 group-hover:text-brand-secondary transition-colors">
                  Fecha {round}
                </h4>
                {roundMatches.every((m) => m.played) && (
                  <span className="ml-4 px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    Fecha Finalizada
                  </span>
                )}
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 group-hover:text-slate-100 transition-colors"
              >
                ▼
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 space-y-4">
                    {roundMatches.map((match, mIdx) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: mIdx * 0.05 }}
                        className="relative group/match"
                      >
                        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-brand-primary/30 hover:bg-slate-800/50 transition-all">
                          {/* Date & Meta */}
                          <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-[0.2em]">
                            <span className="text-slate-500">
                              Partido #{match.id.slice(-4)}
                            </span>
                            <div className="flex items-center gap-2">
                              {editingMatchId === match.id ? (
                                <input
                                  type="datetime-local"
                                  value={scores[match.id]?.date || ""}
                                  onChange={(e) =>
                                    setScores({
                                      ...scores,
                                      [match.id]: {
                                        ...scores[match.id],
                                        date: e.target.value,
                                      },
                                    })
                                  }
                                  className="bg-slate-900 text-brand-accent border border-slate-700 rounded px-2 py-1 outline-none focus:border-brand-accent"
                                />
                              ) : (
                                <span className="text-brand-accent/70">
                                  {formatDate(match.scheduledDate)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Main Scoreboard */}
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-6">
                            <div className="text-right">
                              <span
                                className={`text-sm md:text-base font-black uppercase tracking-tight ${match.played && match.score1! > match.score2! ? "text-brand-primary text-glow" : "text-slate-100"}`}
                              >
                                {match.player1}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-800 shadow-inner">
                              {editingMatchId === match.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={scores[match.id]?.s1 || ""}
                                    onChange={(e) =>
                                      setScores({
                                        ...scores,
                                        [match.id]: {
                                          ...scores[match.id],
                                          s1: e.target.value,
                                        },
                                      })
                                    }
                                    className="w-10 bg-slate-800 text-center rounded-lg font-black text-brand-primary outline-none ring-1 ring-slate-700 focus:ring-brand-primary"
                                  />
                                  <span className="text-slate-600 font-bold">
                                    :
                                  </span>
                                  <input
                                    type="number"
                                    value={scores[match.id]?.s2 || ""}
                                    onChange={(e) =>
                                      setScores({
                                        ...scores,
                                        [match.id]: {
                                          ...scores[match.id],
                                          s2: e.target.value,
                                        },
                                      })
                                    }
                                    className="w-10 bg-slate-800 text-center rounded-lg font-black text-brand-primary outline-none ring-1 ring-slate-700 focus:ring-brand-primary"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 font-orbitron font-black text-2xl">
                                  {match.postponed ? (
                                    <span className="text-yellow-500 text-sm md:text-base tracking-widest uppercase">
                                      Postergado
                                    </span>
                                  ) : (
                                    <>
                                      <span
                                        className={
                                          match.played
                                            ? "text-slate-100"
                                            : "text-slate-700"
                                        }
                                      >
                                        {match.played ? match.score1 : "?"}
                                      </span>
                                      <span className="text-slate-700">:</span>
                                      <span
                                        className={
                                          match.played
                                            ? "text-slate-100"
                                            : "text-slate-700"
                                        }
                                      >
                                        {match.played ? match.score2 : "?"}
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="text-left">
                              <span
                                className={`text-sm md:text-base font-black uppercase tracking-tight ${match.played && match.score2! > match.score1! ? "text-brand-primary text-glow" : "text-slate-100"}`}
                              >
                                {match.player2}
                              </span>
                            </div>
                          </div>

                          {/* Actions & Status */}
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              {match.isOvertime && !editingMatchId && (
                                <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                                  Tiempo Extra
                                </span>
                              )}
                              {editingMatchId === match.id && (
                                <label className="flex items-center gap-2 cursor-pointer group/te">
                                  <input
                                    type="checkbox"
                                    checked={
                                      scores[match.id]?.isOvertime || false
                                    }
                                    onChange={(e) =>
                                      setScores({
                                        ...scores,
                                        [match.id]: {
                                          ...scores[match.id],
                                          isOvertime: e.target.checked,
                                        },
                                      })
                                    }
                                    className="hidden"
                                  />
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border transition-all ${
                                      scores[match.id]?.isOvertime
                                        ? "bg-orange-500 text-white border-orange-500"
                                        : "bg-slate-800 text-slate-500 border-slate-700"
                                    }`}
                                  >
                                    TE
                                  </span>
                                </label>
                              )}

                              {editingMatchId === match.id && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={
                                      scores[match.id]?.postponed || false
                                    }
                                    onChange={(e) =>
                                      setScores({
                                        ...scores,
                                        [match.id]: {
                                          ...scores[match.id],
                                          postponed: e.target.checked,
                                          // If postponed, reset scores/played visual if needed, but keeping simple
                                        },
                                      })
                                    }
                                    className="hidden"
                                  />
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border transition-all ${
                                      scores[match.id]?.postponed
                                        ? "bg-yellow-500 text-black border-yellow-500"
                                        : "bg-slate-800 text-slate-500 border-slate-700"
                                    }`}
                                  >
                                    POST
                                  </span>
                                </label>
                              )}
                            </div>

                            {!readOnly && (
                              <div className="flex items-center gap-2">
                                {editingMatchId === match.id ? (
                                  <button
                                    onClick={() => handleSave(match.id)}
                                    className="p-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all"
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
                                        strokeWidth="3"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleEditClick(match)}
                                    className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all opacity-100 lg:opacity-0 lg:group-hover/match:opacity-100"
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
                                        strokeWidth="2"
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Stats Editing Section */}
                          {editingMatchId === match.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/50"
                            >
                              {[
                                {
                                  player: match.player1,
                                  key: "p1",
                                  color: "text-brand-primary",
                                },
                                {
                                  player: match.player2,
                                  key: "p2",
                                  color: "text-brand-secondary",
                                },
                              ].map((p) => (
                                <div
                                  key={p.key}
                                  className="space-y-2 p-3 rounded-xl bg-slate-900/50 border border-slate-800"
                                >
                                  <p
                                    className={`text-[10px] font-black uppercase tracking-wider ${p.color} mb-2`}
                                  >
                                    {p.player}
                                  </p>
                                  {[
                                    { label: "Tiros", key: "Shots" },
                                    { label: "Atajadas", key: "Saves" },
                                    { label: "Puntos", key: "Points" },
                                  ].map((stat) => {
                                    const fieldKey =
                                      `${p.key}${stat.key}` as keyof (typeof scores)[string];
                                    return (
                                      <div
                                        key={stat.key}
                                        className="flex justify-between items-center gap-2"
                                      >
                                        <span className="text-[10px] text-slate-500 uppercase">
                                          {stat.label}
                                        </span>
                                        <input
                                          type="number"
                                          value={
                                            (scores[match.id] &&
                                              scores[match.id][fieldKey] &&
                                              String(
                                                scores[match.id][fieldKey],
                                              )) ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            setScores((prev) => ({
                                              ...prev,
                                              [match.id]: {
                                                ...prev[match.id],
                                                [fieldKey]: e.target.value,
                                              },
                                            }))
                                          }
                                          className="w-12 bg-slate-800 text-white rounded-md text-[10px] font-bold py-1 text-center outline-none focus:ring-1 focus:ring-slate-600"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};
