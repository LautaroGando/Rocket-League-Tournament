"use client";

import { useTournamentStore } from "@/stores/useTournamentStore";
import { motion } from "framer-motion";

interface Achievement {
  tournamentName: string;
  date: string;
  type: "LEAGUE" | "CUP" | "CHAMPIONS";
}

interface PlayerAchievements {
  playerName: string;
  trophies: Achievement[];
  counts: {
    league: number;
    cup: number;
    champions: number;
  };
}

const PlayerTrophyCard = ({ player }: { player: PlayerAchievements }) => {
  const total =
    player.counts.league + player.counts.cup + player.counts.champions;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      className="group relative h-fit"
    >
      <div className="glass-card rounded-3xl p-6 xs:p-8 border-white/5 hover:border-yellow-500/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(234,179,8,0.15)] overflow-hidden">
        {/* Decorative background number */}
        <span className="absolute -right-4 -top-8 text-[80px] xs:text-[120px] font-black text-white/3 pointer-events-none select-none italic">
          #{total}
        </span>

        <div className="relative">
          {/* Header */}
          <div className="mb-8">
            <h4 className="text-2xl xs:text-3xl font-black text-white group-hover:text-yellow-400 transition-colors font-orbitron tracking-tight mb-2">
              {player.playerName}
            </h4>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-8 bg-yellow-500/50"></span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.3em]">
                Campeón Clasificado
              </span>
            </div>
          </div>

          {/* Major Stats */}
          <div className="grid grid-cols-3 gap-2 xs:gap-3 mb-8">
            {[
              {
                label: "Ligas",
                count: player.counts.league,
                color: "text-brand-primary",
                bg: "bg-brand-primary/10",
              },
              {
                label: "Copas",
                count: player.counts.cup,
                color: "text-brand-secondary",
                bg: "bg-brand-secondary/10",
              },
              {
                label: "Champions",
                count: player.counts.champions,
                color: "text-yellow-500",
                bg: "bg-yellow-500/10",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${stat.bg} rounded-2xl p-3 text-center border border-white/5`}
              >
                <div
                  className={`${stat.color} text-xl xs:text-2xl font-black font-orbitron`}
                >
                  {stat.count}
                </div>
                <div className="text-[9px] uppercase text-slate-500 font-black tracking-widest mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Trophy Timeline */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
            {player.trophies.map((t, idx) => (
              <div
                key={`${t.tournamentName}-${idx}`}
                className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 hover:border-yellow-500/20 transition-all group/item"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    t.type === "LEAGUE"
                      ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                      : t.type === "CUP"
                        ? "bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20"
                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  }`}
                >
                  <span className="text-xs font-black font-orbitron">
                    {t.type === "LEAGUE" ? "L" : t.type === "CUP" ? "C" : "CH"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-200 truncate group-hover/item:text-white transition-colors">
                    {t.tournamentName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {new Date(t.date).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Badge */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                Leyenda de Élite
              </span>
            </div>
            <div className="flex gap-1">
              {[...Array(Math.min(total, 5))].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-3 rounded-full bg-yellow-500/20"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const TrophyRoom = () => {
  const { tournaments } = useTournamentStore();

  const getPlayerAchievements = (): PlayerAchievements[] => {
    const rawChampions: {
      playerName: string;
      tournamentName: string;
      date: string;
      type: "LEAGUE" | "CUP" | "CHAMPIONS";
    }[] = [];

    tournaments.forEach((t) => {
      if (t.status !== "FINISHED") return;

      let winnerName: string | null = t.champion?.name || null;

      if (!winnerName && t.type === "LEAGUE") {
        const topDiv = t.divisions[0];
        if (topDiv && topDiv.players.length > 0) {
          const sorted = [...topDiv.players].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference)
              return b.goalDifference - a.goalDifference;
            return b.goalsInFavor - a.goalsInFavor;
          });
          winnerName = sorted[0].name;
        }
      }

      if (winnerName) {
        rawChampions.push({
          playerName: winnerName,
          tournamentName: t.name,
          date: t.date,
          type: t.type as "LEAGUE" | "CUP" | "CHAMPIONS",
        });
      }
    });

    const playerMap: Record<string, PlayerAchievements> = {};
    rawChampions.forEach((c) => {
      if (!playerMap[c.playerName]) {
        playerMap[c.playerName] = {
          playerName: c.playerName,
          trophies: [],
          counts: { league: 0, cup: 0, champions: 0 },
        };
      }
      playerMap[c.playerName].trophies.push({
        tournamentName: c.tournamentName,
        date: c.date,
        type: c.type,
      });
      if (c.type === "LEAGUE") playerMap[c.playerName].counts.league++;
      if (c.type === "CUP") playerMap[c.playerName].counts.cup++;
      if (c.type === "CHAMPIONS") playerMap[c.playerName].counts.champions++;
    });

    return Object.values(playerMap).sort((a, b) => {
      const totalA = a.counts.league + a.counts.cup + a.counts.champions;
      const totalB = b.counts.league + b.counts.cup + b.counts.champions;
      return totalB - totalA;
    });
  };

  const players = getPlayerAchievements();
  if (players.length === 0) return null;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className="mt-24 pt-24 border-t border-slate-800/50"
    >
      <div className="text-center mb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <h2 className="text-3xl xs:text-5xl md:text-7xl font-black text-glow font-orbitron uppercase tracking-tighter mb-6 bg-linear-to-b from-yellow-200 via-yellow-400 to-yellow-700 bg-clip-text text-transparent px-4">
          Salón de la Fama
        </h2>
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="h-px w-12 bg-yellow-500/30"></span>
          <p className="text-yellow-500/80 font-orbitron text-xs uppercase tracking-[0.4em]">
            Leyendas Eternas del Campo
          </p>
          <span className="h-px w-12 bg-yellow-500/30"></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {players.map((p) => (
          <PlayerTrophyCard key={p.playerName} player={p} />
        ))}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(234, 179, 8, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(234, 179, 8, 0.4);
        }
      `,
        }}
      />
    </motion.div>
  );
};
