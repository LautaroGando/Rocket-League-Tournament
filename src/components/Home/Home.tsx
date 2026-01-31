"use client";
import { useEffect } from "react";
import { useTournamentStore } from "@/stores/useTournamentStore";
import { Tables } from "./Tables";

export const Home = () => {
  const loadTournaments = useTournamentStore((state) => state.loadTournaments);

  useEffect(() => {
    loadTournaments();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadTournaments();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadTournaments]);

  return <Tables />;
};
