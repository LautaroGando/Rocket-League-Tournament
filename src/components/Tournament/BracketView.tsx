import React from "react";
import { IMatch } from "@/interfaces";
import { motion } from "framer-motion";

interface Props {
  matches: IMatch[];
}

export const BracketView = ({ matches }: Props) => {
  // Organize matches by round
  const rounds: { [key: number]: IMatch[] } = {};
  matches.forEach((m) => {
    if (!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  });

  const roundNumbers = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="flex overflow-x-auto p-6 space-x-16 custom-scrollbar pb-12 w-full">
      {roundNumbers.map((round, rIdx) => (
        <div key={round} className="flex flex-col min-w-[300px]">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rIdx * 0.1 }}
            className="text-center mb-8 relative"
          >
            <h3 className="text-xl font-black text-brand-secondary font-orbitron uppercase tracking-[0.2em] relative z-10">
              {getRoundName(round, roundNumbers.length)}
            </h3>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-secondary/30 rounded-full"></div>
          </motion.div>

          <div className="flex flex-col justify-around grow space-y-12">
            {rounds[round].map((match, mIdx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rIdx * 0.1 + mIdx * 0.05 }}
                className="relative group h-fit"
              >
                <div className="glass-panel rounded-2xl p-4 border-slate-800/50 hover:border-brand-primary/40 hover:bg-slate-800/40 transition-all duration-300 shadow-xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary/20 group-hover:bg-brand-primary/60 transition-all"></div>

                  <div className="space-y-3">
                    {/* Player 1 */}
                    <div className="flex justify-between items-center gap-4">
                      <span
                        className={`text-sm font-black uppercase tracking-tight transition-colors ${
                          match.played && match.score1! > match.score2!
                            ? "text-brand-primary text-glow"
                            : "text-slate-100"
                        }`}
                      >
                        {match.player1 || "Por definir"}
                      </span>
                      <span
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm border transition-all ${
                          match.played
                            ? "bg-slate-900 border-slate-800 text-slate-100"
                            : "bg-slate-950/50 border-slate-900 text-slate-700"
                        }`}
                      >
                        {match.score1 ?? "-"}
                      </span>
                    </div>

                    {/* Player 2 */}
                    <div className="flex justify-between items-center gap-4">
                      <span
                        className={`text-sm font-black uppercase tracking-tight transition-colors ${
                          match.played && match.score2! > match.score1!
                            ? "text-brand-primary text-glow"
                            : "text-slate-100"
                        }`}
                      >
                        {match.player2 || "Por definir"}
                      </span>
                      <span
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm border transition-all ${
                          match.played
                            ? "bg-slate-900 border-slate-800 text-slate-100"
                            : "bg-slate-950/50 border-slate-900 text-slate-700"
                        }`}
                      >
                        {match.score2 ?? "-"}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator Bar */}
                  {match.played && (
                    <div className="mt-3 pt-3 border-t border-slate-800/50 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-brand-accent tracking-widest opacity-60">
                        Finalizado
                      </span>
                      {match.isOvertime && (
                        <span className="text-[8px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20 font-black uppercase">
                          TE
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Vertical Connector line (for later implementation if needed) */}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const getRoundName = (round: number, totalRounds: number) => {
  const diff = totalRounds - round;
  if (diff === 0) return "Gran Final";
  if (diff === 1) return "Semifinales";
  if (diff === 2) return "Cuartos";
  if (diff === 3) return "Octavos";
  return `Ronda ${round}`;
};
