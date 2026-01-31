-- AlterTable
ALTER TABLE "Division" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "scheduledDate" TIMESTAMP(3);
