import { useState, useMemo } from "react";
import { useTournamentStore } from "@/stores/useTournamentStore";
import { useUiStore } from "@/stores/useUiStore";
import { ITournament, IPlayer } from "@/interfaces";

interface Props {
  tournament: ITournament;
}

export const PromotionsPanel = ({ tournament }: Props) => {
  const { createPromotionDivision, createNextSeason } = useTournamentStore();
  const { showAlert, showConfirm, showPrompt } = useUiStore();

  const [divHighId, setDivHighId] = useState(tournament.divisions[0]?.id || "");
  const [divLowId, setDivLowId] = useState(tournament.divisions[1]?.id || "");

  // Helper to find division
  const getDiv = (id: string) => tournament.divisions.find((d) => d.id === id);

  // Determine effective IDs (fallback to defaults if selected ID is invalid/deleted)
  const effectiveHighId =
    tournament.divisions.find((d) => d.id === divHighId)?.id ||
    tournament.divisions[0]?.id ||
    "";
  const effectiveLowId =
    tournament.divisions.find((d) => d.id === divLowId)?.id ||
    tournament.divisions[1]?.id ||
    "";

  // Use effective IDs for logic
  const divHigh = getDiv(effectiveHighId);
  const divLow = getDiv(effectiveLowId);

  // Settings derived from divisions or defaults
  const directRelSpots = divHigh?.directRelegationSpots || 0;
  const playoffRelSpots = divHigh?.playoffRelegationSpots || 0;

  const directPromSpots = divLow?.directPromotionSpots || 0;
  const playoffPromSpots = divLow?.playoffPromotionSpots || 0;

  // Compute Candidates
  const previewData = useMemo(() => {
    if (!divHigh || !divLow) return null;

    // Sort Logic (Points > GD)
    const sortFn = (a: IPlayer, b: IPlayer) =>
      b.points - a.points || b.goalDifference - a.goalDifference;

    const sortedHigh = [...divHigh.players].sort(sortFn);
    const sortedLow = [...divLow.players].sort(sortFn);

    // Relegation Candidates (High Div Bottom)
    // Direct: Last N
    const directRelCandidates = sortedHigh.slice(
      Math.max(0, sortedHigh.length - directRelSpots),
    );
    // Playoff: The N before that
    const playoffRelCandidates = sortedHigh.slice(
      Math.max(0, sortedHigh.length - directRelSpots - playoffRelSpots),
      Math.max(0, sortedHigh.length - directRelSpots),
    );

    // Promotion Candidates (Low Div Top)
    // Direct: Top N
    const directPromCandidates = sortedLow.slice(0, directPromSpots);
    // Playoff: The N after that
    const playoffPromCandidates = sortedLow.slice(
      directPromSpots,
      directPromSpots + playoffPromSpots,
    );

    return {
      directRelCandidates,
      playoffRelCandidates,
      directPromCandidates,
      playoffPromCandidates,
    };
  }, [
    divHigh,
    divLow,
    directRelSpots,
    playoffRelSpots,
    directPromSpots,
    playoffPromSpots,
  ]);

  const handleCreatePlayoff = async () => {
    if (!effectiveHighId || !effectiveLowId)
      return showAlert("Error", "Selecciona divisiones");
    if (effectiveHighId === effectiveLowId)
      return showAlert("Error", "Deben ser divisiones distintas");

    const spots = Math.max(playoffRelSpots, playoffPromSpots);

    await showAlert(
      "Generando Promoción",
      `Generando Promoción entre: ${divHigh?.name} vs ${divLow?.name}\n(Lugares: ${spots})`,
    );

    createPromotionDivision(
      tournament.id,
      effectiveHighId,
      effectiveLowId,
      directRelSpots,
      directPromSpots,
      spots,
    );
    await showAlert(
      "Éxito",
      "Partidos de Promoción generados! Revisa la nueva pestaña de Promoción.",
    );
  };

  const handleNextSeason = async () => {
    const name = await showPrompt(
      "Nueva Temporada",
      "Nombre para la Nueva Temporada (ej: Temporada 2):",
      `Temporada Siguiente de ${tournament.name}`,
    );
    if (!name) return;

    const confirmed = await showConfirm(
      "Finalizar Torneo",
      "¿Estás seguro? Se creará un NUEVO torneo. Se aplicarán todos los ascensos/descensos directos Y los resultados de los partidos de promoción jugados. Las estadísticas se reiniciarán.",
    );

    if (confirmed) {
      createNextSeason(tournament.id, name);
      await showAlert(
        "Éxito",
        "Nueva temporada creada! Ve al panel principal para seleccionarla.",
      );
    }
  };

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-purple-500/30">
      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400 mb-6 flex items-center gap-2">
        <span>⚡</span> Gestión de Ascensos y Descensos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-400 text-sm mb-2">
            División Superior (A)
          </label>
          <select
            value={effectiveHighId}
            onChange={(e) => setDivHighId(e.target.value)}
            className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
          >
            {tournament.divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-red-400 mt-1">
            Descenso Directo: {directRelSpots} | Promoción: {playoffRelSpots}
          </p>
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-2">
            División Inferior (B)
          </label>
          <select
            value={effectiveLowId}
            onChange={(e) => setDivLowId(e.target.value)}
            className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
          >
            {tournament.divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-green-400 mt-1">
            Ascenso Directo: {directPromSpots} | Promoción: {playoffPromSpots}
          </p>
        </div>
      </div>

      {previewData && (
        <div className="bg-gray-700/50 p-4 rounded mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="border-r border-gray-600 pr-4">
            <h4 className="font-bold text-red-400 mb-2">Descenso Directo ▼</h4>
            <ul className="list-disc pl-4 text-gray-300">
              {previewData.directRelCandidates.length > 0 ? (
                previewData.directRelCandidates.map((p) => (
                  <li key={p.name}>{p.name}</li>
                ))
              ) : (
                <li className="text-gray-500 italic">Nadie</li>
              )}
            </ul>

            <h4 className="font-bold text-yellow-400 mt-4 mb-2">
              Promoción (Defiende) 🛡️
            </h4>
            <ul className="list-disc pl-4 text-gray-300">
              {previewData.playoffRelCandidates.length > 0 ? (
                previewData.playoffRelCandidates.map((p) => (
                  <li key={p.name}>{p.name}</li>
                ))
              ) : (
                <li className="text-gray-500 italic">Nadie</li>
              )}
            </ul>
          </div>

          <div className="pl-4">
            <h4 className="font-bold text-green-400 mb-2">Ascenso Directo ▲</h4>
            <ul className="list-disc pl-4 text-gray-300">
              {previewData.directPromCandidates.length > 0 ? (
                previewData.directPromCandidates.map((p) => (
                  <li key={p.name}>{p.name}</li>
                ))
              ) : (
                <li className="text-gray-500 italic">Nadie</li>
              )}
            </ul>

            <h4 className="font-bold text-yellow-400 mt-4 mb-2">
              Promoción (Ataca) ⚔️
            </h4>
            <ul className="list-disc pl-4 text-gray-300">
              {previewData.playoffPromCandidates.length > 0 ? (
                previewData.playoffPromCandidates.map((p) => (
                  <li key={p.name}>{p.name}</li>
                ))
              ) : (
                <li className="text-gray-500 italic">Nadie</li>
              )}
            </ul>
          </div>
        </div>
      )}

      <div className="flex gap-4 flex-col md:flex-row">
        <button
          className="bg-purple-600/80 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition-colors flex-1 shadow-lg border border-purple-500"
          onClick={handleCreatePlayoff}
          disabled={
            !previewData ||
            (previewData?.playoffRelCandidates.length === 0 &&
              previewData?.playoffPromCandidates.length === 0)
          }
        >
          1. Generar Partidos de Promoción
        </button>
        <button
          className="bg-blue-600/80 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors flex-1 shadow-lg border border-blue-500"
          onClick={handleNextSeason}
        >
          2. Finalizar Torneo y Crear Siguiente Temporada
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        &quot;Finalizar Torneo&quot; creará uno nuevo aplicando Automáticamente
        los ascensos/descensos directos Y los resultados de los partidos de
        promoción jugados.
      </p>
    </div>
  );
};
