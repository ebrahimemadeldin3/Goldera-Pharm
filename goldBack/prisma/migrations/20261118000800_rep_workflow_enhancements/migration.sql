-- CreateEnum
CREATE TYPE "VisitCompanionType" AS ENUM ('SINGLE', 'WITH_MANAGER');

-- CreateEnum
CREATE TYPE "VisitCreationSource" AS ENUM ('SCHEDULED', 'MANUAL_HISTORY');

-- CreateEnum
CREATE TYPE "ForecastTargetType" AS ENUM ('DOCTOR', 'PHARMACIST');

-- AlterEnum
ALTER TYPE "RequestType" ADD VALUE 'MONTHLY_MARKETING';

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "accompanyingManagerId" TEXT,
ADD COLUMN     "companionType" "VisitCompanionType",
ADD COLUMN     "creationSource" "VisitCreationSource" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "duration" TEXT;

-- AlterTable
ALTER TABLE "forecast" ADD COLUMN     "targetType" "ForecastTargetType" NOT NULL DEFAULT 'DOCTOR';

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_accompanyingManagerId_fkey" FOREIGN KEY ("accompanyingManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

