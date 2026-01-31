import { IPlayer } from "@/interfaces";
import { createPlayer } from "@/helpers";
import { create } from "zustand";

interface Props {
  players: IPlayer[];
  addPlayer: (name: string) => void;
}

export const usePlayersStore = create<Props>((set) => ({
  players: [],
  addPlayer: (name: string) =>
    set((state) => ({
      players: [...state.players, createPlayer(name)],
    })),
}));
