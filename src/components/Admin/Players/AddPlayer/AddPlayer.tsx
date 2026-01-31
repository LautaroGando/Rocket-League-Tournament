import { usePlayersStore } from "@/stores";
import { useState } from "react";

export const AddPlayer = () => {
  const addPlayer = usePlayersStore((state) => state.addPlayer);
  const [name, setName] = useState<string>("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addPlayer(name);
    setName("");
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Nombre del jugador"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleAdd}>Agregar jugador</button>
    </div>
  );
};
