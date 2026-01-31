import { createTournament } from "@/actions/tournament-actions";
import { TournamentType } from "@/enums";

async function main() {
  try {
    console.log("Attempting to create tournament...");
    const result = await createTournament(
      "Test Tournament",
      [{ name: "Player 1" }, { name: "Player 2" }],
      "Division 1",
      TournamentType.LEAGUE,
    );
    console.log("Tournament created:", result);
  } catch (error) {
    console.error("Error creating tournament:", error);
  }
}

main();
