import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding tournament 'Clasificación'...");

  // Cleanup existing data if needed (Optional, proceed with caution)
  await prisma.tournament.deleteMany();
  await prisma.player.deleteMany();
  await prisma.match.deleteMany();
  await prisma.division.deleteMany();

  const tournament = await prisma.tournament.create({
    data: {
      name: "Clasificación",
      type: "LEAGUE",
      status: "ACTIVE",
    } as Prisma.TournamentCreateInput & { status: string },
  });

  const division = await prisma.division.create({
    data: {
      name: "División Única",
      tournamentId: tournament.id,
      directPromotionSpots: 0,
      playoffPromotionSpots: 0,
      directRelegationSpots: 0,
      playoffRelegationSpots: 0,
    },
  });

  const playerNames = [
    "Gandito",
    "Jota",
    "Piro",
    "Gonza",
    "Yago",
    "Rod",
    "Fran",
    "Tito",
    "Tarro",
    "Shoaco",
    "Brian",
    "Nachito",
    "Joaco",
    "Royal",
    "Andy",
    "Cruz",
    "Fojo",
    "Nacho",
    "Tizi",
    "Ciro",
  ];

  await prisma.player.createMany({
    data: playerNames.map((name) => ({
      name,
      divisionId: division.id,
    })),
  });

  const matches: {
    p1: string;
    p2: string;
    played: boolean;
    round: number;
    date?: string;
  }[] = [
    // Fecha 1
    {
      p1: "Royal",
      p2: "Ciro",
      played: false,
      round: 1,
    },
    {
      p1: "Gonza",
      p2: "Tito",
      played: false,
      round: 1,
    },
    {
      p1: "Tizi",
      p2: "Joaco",
      played: false,
      round: 1,
    },
    { p1: "Rod", p2: "Shoaco", played: false, round: 1 },
    { p1: "Fran", p2: "Jota", played: false, round: 1 },
    { p1: "Andy", p2: "Nachito", played: false, round: 1 },
    { p1: "Gandito", p2: "Fojo", played: false, round: 1 },
    { p1: "Tarro", p2: "Piro", played: false, round: 1 },
    { p1: "Brian", p2: "Nacho", played: false, round: 1 },
    { p1: "Cruz", p2: "Yago", played: false, round: 1 },

    // Fecha 2
    { p1: "Jota", p2: "Brian", played: false, round: 2 },
    { p1: "Joaco", p2: "Royal", played: false, round: 2 },
    { p1: "Yago", p2: "Gandito", played: false, round: 2 },
    { p1: "Nachito", p2: "Fran", played: false, round: 2 },
    { p1: "Shoaco", p2: "Gonza", played: false, round: 2 },
    { p1: "Fojo", p2: "Andy", played: false, round: 2 },
    { p1: "Tito", p2: "Tizi", played: false, round: 2 },
    { p1: "Nacho", p2: "Tarro", played: false, round: 2 },
    { p1: "Rod", p2: "Cruz", played: false, round: 2 },
    { p1: "Piro", p2: "Ciro", played: false, round: 2 },

    // Fecha 3
    { p1: "Tizi", p2: "Shoaco", played: false, round: 3 },
    { p1: "Andy", p2: "Gandito", played: false, round: 3 },
    { p1: "Fran", p2: "Fojo", played: false, round: 3 },
    { p1: "Royal", p2: "Tito", played: false, round: 3 },
    { p1: "Tarro", p2: "Jota", played: false, round: 3 },
    { p1: "Ciro", p2: "Nacho", played: false, round: 3 },
    { p1: "Yago", p2: "Rod", played: false, round: 3 },
    { p1: "Brian", p2: "Nachito", played: false, round: 3 },
    { p1: "Piro", p2: "Joaco", played: false, round: 3 },
    { p1: "Gonza", p2: "Cruz", played: false, round: 3 },

    // Fecha 4
    { p1: "Shoaco", p2: "Royal", played: false, round: 4 },
    { p1: "Gonza", p2: "Rod", played: false, round: 4 },
    { p1: "Gandito", p2: "Fran", played: false, round: 4 },
    { p1: "Fojo", p2: "Brian", played: false, round: 4 },
    { p1: "Tito", p2: "Piro", played: false, round: 4 },
    { p1: "Andy", p2: "Yago", played: false, round: 4 },
    { p1: "Cruz", p2: "Tizi", played: false, round: 4 },
    { p1: "Nachito", p2: "Tarro", played: false, round: 4 },
    { p1: "Ciro", p2: "Jota", played: false, round: 4 },
    { p1: "Nacho", p2: "Joaco", played: false, round: 4 },

    // Fecha 5
    { p1: "Yago", p2: "Gonza", played: false, round: 5 },
    { p1: "Tizi", p2: "Rod", played: false, round: 5 },
    { p1: "Fran", p2: "Andy", played: false, round: 5 },
    { p1: "Brian", p2: "Gandito", played: false, round: 5 },
    { p1: "Ciro", p2: "Nachito", played: false, round: 5 },
    { p1: "Royal", p2: "Cruz", played: false, round: 5 },
    { p1: "Joaco", p2: "Jota", played: false, round: 5 },
    { p1: "Piro", p2: "Shoaco", played: false, round: 5 },
    { p1: "Nacho", p2: "Tito", played: false, round: 5 },
    { p1: "Tarro", p2: "Fojo", played: false, round: 5 },

    // Fecha 6
    { p1: "Fran", p2: "Yago", played: false, round: 6 },
    { p1: "Rod", p2: "Royal", played: false, round: 6 },
    { p1: "Gandito", p2: "Tarro", played: false, round: 6 },
    { p1: "Tizi", p2: "Gonza", played: false, round: 6 },
    { p1: "Shoaco", p2: "Nacho", played: false, round: 6 },
    { p1: "Fojo", p2: "Ciro", played: false, round: 6 },
    { p1: "Jota", p2: "Tito", played: false, round: 6 },
    { p1: "Joaco", p2: "Nachito", played: false, round: 6 },
    { p1: "Brian", p2: "Andy", played: false, round: 6 },
    { p1: "Cruz", p2: "Piro", played: false, round: 6 },

    // Fecha 7
    { p1: "Tito", p2: "Nachito", played: false, round: 7 },
    { p1: "Yago", p2: "Tizi", played: false, round: 7 },
    { p1: "Royal", p2: "Gonza", played: false, round: 7 },
    { p1: "Tarro", p2: "Andy", played: false, round: 7 },
    { p1: "Ciro", p2: "Gandito", played: false, round: 7 },
    { p1: "Joaco", p2: "Fojo", played: false, round: 7 },
    { p1: "Nacho", p2: "Cruz", played: false, round: 7 },
    { p1: "Jota", p2: "Shoaco", played: false, round: 7 },
    { p1: "Brian", p2: "Fran", played: false, round: 7 },
    { p1: "Piro", p2: "Rod", played: false, round: 7 },

    // Fecha 8
    { p1: "Rod", p2: "Nacho", played: false, round: 8 },
    { p1: "Royal", p2: "Tizi", played: false, round: 8 },
    { p1: "Jota", p2: "Cruz", played: false, round: 8 },
    { p1: "Tarro", p2: "Fran", played: false, round: 8 },
    { p1: "Gandito", p2: "Joaco", played: false, round: 8 },
    { p1: "Tito", p2: "Fojo", played: false, round: 8 },
    { p1: "Nachito", p2: "Shoaco", played: false, round: 8 },
    { p1: "Andy", p2: "Ciro", played: false, round: 8 },
    { p1: "Gonza", p2: "Piro", played: false, round: 8 },
    { p1: "Yago", p2: "Brian", played: false, round: 8 },

    // Fecha 9
    { p1: "Royal", p2: "Yago", played: false, round: 9 },
    { p1: "Jota", p2: "Rod", played: false, round: 9 },
    { p1: "Nachito", p2: "Cruz", played: false, round: 9 },
    { p1: "Tito", p2: "Gandito", played: false, round: 9 },
    { p1: "Nacho", p2: "Gonza", played: false, round: 9 },
    { p1: "Piro", p2: "Tizi", played: false, round: 9 },
    { p1: "Ciro", p2: "Fran", played: false, round: 9 },
    { p1: "Tarro", p2: "Brian", played: false, round: 9 },
    { p1: "Joaco", p2: "Andy", played: false, round: 9 },
    { p1: "Shoaco", p2: "Fojo", played: false, round: 9 },

    // Fecha 10
    { p1: "Nachito", p2: "Rod", played: false, round: 10 },
    { p1: "Yago", p2: "Tarro", played: false, round: 10 },
    { p1: "Piro", p2: "Royal", played: false, round: 10 },
    { p1: "Ciro", p2: "Brian", played: false, round: 10 },
    { p1: "Tizi", p2: "Nacho", played: false, round: 10 },
    { p1: "Fran", p2: "Joaco", played: false, round: 10 },
    { p1: "Gonza", p2: "Jota", played: false, round: 10 },
    { p1: "Andy", p2: "Tito", played: false, round: 10 },
    { p1: "Shoaco", p2: "Gandito", played: false, round: 10 },
    { p1: "Fojo", p2: "Cruz", played: false, round: 10 },

    // Fecha 11
    { p1: "Piro", p2: "Yago", played: false, round: 11 },
    { p1: "Ciro", p2: "Tarro", played: false, round: 11 },
    { p1: "Nacho", p2: "Royal", played: false, round: 11 },
    { p1: "Joaco", p2: "Brian", played: false, round: 11 },
    { p1: "Jota", p2: "Tizi", played: false, round: 11 },
    { p1: "Tito", p2: "Fran", played: false, round: 11 },
    { p1: "Nachito", p2: "Gonza", played: false, round: 11 },
    { p1: "Shoaco", p2: "Andy", played: false, round: 11 },
    { p1: "Fojo", p2: "Rod", played: false, round: 11 },
    { p1: "Cruz", p2: "Gandito", played: false, round: 11 },

    // Fecha 12
    { p1: "Yago", p2: "Ciro", played: false, round: 12 },
    { p1: "Nacho", p2: "Piro", played: false, round: 12 },
    { p1: "Joaco", p2: "Tarro", played: false, round: 12 },
    { p1: "Jota", p2: "Royal", played: false, round: 12 },
    { p1: "Brian", p2: "Tito", played: false, round: 12 },
    { p1: "Tizi", p2: "Nachito", played: false, round: 12 },
    { p1: "Fran", p2: "Shoaco", played: false, round: 12 },
    { p1: "Fojo", p2: "Gonza", played: false, round: 12 },
    { p1: "Cruz", p2: "Andy", played: false, round: 12 },
    { p1: "Gandito", p2: "Rod", played: false, round: 12 },

    // Fecha 13
    { p1: "Nacho", p2: "Yago", played: false, round: 13 },
    { p1: "Joaco", p2: "Ciro", played: false, round: 13 },
    { p1: "Jota", p2: "Piro", played: false, round: 13 },
    { p1: "Tito", p2: "Tarro", played: false, round: 13 },
    { p1: "Nachito", p2: "Royal", played: false, round: 13 },
    { p1: "Shoaco", p2: "Brian", played: false, round: 13 },
    { p1: "Fojo", p2: "Tizi", played: false, round: 13 },
    { p1: "Cruz", p2: "Fran", played: false, round: 13 },
    { p1: "Gandito", p2: "Gonza", played: false, round: 13 },
    { p1: "Rod", p2: "Andy", played: false, round: 13 },

    // Fecha 14
    { p1: "Yago", p2: "Joaco", played: false, round: 14 },
    { p1: "Jota", p2: "Nacho", played: false, round: 14 },
    { p1: "Tito", p2: "Ciro", played: false, round: 14 },
    { p1: "Nachito", p2: "Piro", played: false, round: 14 },
    { p1: "Tarro", p2: "Shoaco", played: false, round: 14 },
    { p1: "Royal", p2: "Fojo", played: false, round: 14 },
    { p1: "Cruz", p2: "Brian", played: false, round: 14 },
    { p1: "Gandito", p2: "Tizi", played: false, round: 14 },
    { p1: "Rod", p2: "Fran", played: false, round: 14 },
    { p1: "Andy", p2: "Gonza", played: false, round: 14 },

    // Fecha 15
    { p1: "Yago", p2: "Jota", played: false, round: 15 },
    { p1: "Tito", p2: "Joaco", played: false, round: 15 },
    { p1: "Nachito", p2: "Nacho", played: false, round: 15 },
    { p1: "Shoaco", p2: "Ciro", played: false, round: 15 },
    { p1: "Fojo", p2: "Piro", played: false, round: 15 },
    { p1: "Cruz", p2: "Tarro", played: false, round: 15 },
    { p1: "Gandito", p2: "Royal", played: false, round: 15 },
    { p1: "Rod", p2: "Brian", played: false, round: 15 },
    { p1: "Andy", p2: "Tizi", played: false, round: 15 },
    { p1: "Gonza", p2: "Fran", played: false, round: 15 },

    // Fecha 16
    { p1: "Tito", p2: "Yago", played: false, round: 16 },
    { p1: "Nachito", p2: "Jota", played: false, round: 16 },
    { p1: "Shoaco", p2: "Joaco", played: false, round: 16 },
    { p1: "Fojo", p2: "Nacho", played: false, round: 16 },
    { p1: "Ciro", p2: "Cruz", played: false, round: 16 },
    { p1: "Piro", p2: "Gandito", played: false, round: 16 },
    { p1: "Rod", p2: "Tarro", played: false, round: 16 },
    { p1: "Andy", p2: "Royal", played: false, round: 16 },
    { p1: "Gonza", p2: "Brian", played: false, round: 16 },
    { p1: "Fran", p2: "Tizi", played: false, round: 16 },

    // Fecha 17
    { p1: "Yago", p2: "Nachito", played: false, round: 17 },
    { p1: "Shoaco", p2: "Tito", played: false, round: 17 },
    { p1: "Fojo", p2: "Jota", played: false, round: 17 },
    { p1: "Cruz", p2: "Joaco", played: false, round: 17 },
    { p1: "Gandito", p2: "Nacho", played: false, round: 17 },
    { p1: "Rod", p2: "Ciro", played: false, round: 17 },
    { p1: "Andy", p2: "Piro", played: false, round: 17 },
    { p1: "Gonza", p2: "Tarro", played: false, round: 17 },
    { p1: "Fran", p2: "Royal", played: false, round: 17 },
    { p1: "Tizi", p2: "Brian", played: false, round: 17 },

    // Fecha 18
    { p1: "Shoaco", p2: "Yago", played: false, round: 18 },
    { p1: "Fojo", p2: "Nachito", played: false, round: 18 },
    { p1: "Cruz", p2: "Tito", played: false, round: 18 },
    { p1: "Gandito", p2: "Jota", played: false, round: 18 },
    { p1: "Joaco", p2: "Rod", played: false, round: 18 },
    { p1: "Nacho", p2: "Andy", played: false, round: 18 },
    { p1: "Gonza", p2: "Ciro", played: false, round: 18 },
    { p1: "Fran", p2: "Piro", played: false, round: 18 },
    { p1: "Tizi", p2: "Tarro", played: false, round: 18 },
    { p1: "Brian", p2: "Royal", played: false, round: 18 },

    // Fecha 19
    { p1: "Yago", p2: "Fojo", played: false, round: 19 },
    { p1: "Cruz", p2: "Shoaco", played: false, round: 19 },
    { p1: "Gandito", p2: "Nachito", played: false, round: 19 },
    { p1: "Rod", p2: "Tito", played: false, round: 19 },
    { p1: "Andy", p2: "Jota", played: false, round: 19 },
    { p1: "Gonza", p2: "Joaco", played: false, round: 19 },
    { p1: "Fran", p2: "Nacho", played: false, round: 19 },
    { p1: "Tizi", p2: "Ciro", played: false, round: 19 },
    { p1: "Brian", p2: "Piro", played: false, round: 19 },
    { p1: "Royal", p2: "Tarro", played: false, round: 19 },
  ];

  await prisma.match.createMany({
    data: matches.map((m) => ({
      divisionId: division.id,
      player1Name: m.p1,
      player2Name: m.p2,
      score1: null,
      score2: null,
      played: false,
      round: m.round,
      scheduledDate: m.date ? new Date(m.date) : null,
      isOvertime: false,
    })),
  });

  console.log("Seeding complete! 🚀");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
