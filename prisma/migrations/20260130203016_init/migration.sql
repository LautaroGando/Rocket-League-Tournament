-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "championId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_championId_fkey" FOREIGN KEY ("championId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
