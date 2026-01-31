"use client";
import { usePlayersStore } from "@/stores";
import { AddPlayer } from "./AddPlayer";

export const Players = () => {
  const { players } = usePlayersStore();

  return (
    <div className="w-96 h-40 border border-gray-300">
      <AddPlayer />
      {players.map((player, i) => (
        <div key={i}>
          <h3>{player.name}</h3>
        </div>
      ))}
    </div>
  );
};
