-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'LEAGUE',

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "directPromotionSpots" INTEGER NOT NULL DEFAULT 0,
    "playoffPromotionSpots" INTEGER NOT NULL DEFAULT 0,
    "directRelegationSpots" INTEGER NOT NULL DEFAULT 0,
    "playoffRelegationSpots" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "matchesWon" INTEGER NOT NULL DEFAULT 0,
    "matchesLost" INTEGER NOT NULL DEFAULT 0,
    "matchesTied" INTEGER NOT NULL DEFAULT 0,
    "extraTimeGames" INTEGER NOT NULL DEFAULT 0,
    "goalsInFavor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDifference" INTEGER NOT NULL DEFAULT 0,
    "pointsInMatch" INTEGER NOT NULL DEFAULT 0,
    "shooting" INTEGER NOT NULL DEFAULT 0,
    "saved" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "player1Name" TEXT NOT NULL,
    "player2Name" TEXT NOT NULL,
    "score1" INTEGER,
    "score2" INTEGER,
    "played" BOOLEAN NOT NULL DEFAULT false,
    "isOvertime" BOOLEAN NOT NULL DEFAULT false,
    "p1Shots" INTEGER NOT NULL DEFAULT 0,
    "p1Saves" INTEGER NOT NULL DEFAULT 0,
    "p1Points" INTEGER NOT NULL DEFAULT 0,
    "p2Shots" INTEGER NOT NULL DEFAULT 0,
    "p2Saves" INTEGER NOT NULL DEFAULT 0,
    "p2Points" INTEGER NOT NULL DEFAULT 0,
    "round" INTEGER NOT NULL DEFAULT 1,
    "nextMatchId" TEXT,
    "nextMatchSlot" INTEGER,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;
