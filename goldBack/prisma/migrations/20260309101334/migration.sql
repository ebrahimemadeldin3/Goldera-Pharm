-- AlterEnum
ALTER TYPE "RequestType" ADD VALUE 'PERSONAL_EXPENSE';

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "personalExpenseData" JSONB[],
ADD COLUMN     "visitDaysCount" INTEGER,
ADD COLUMN     "visitedCity" TEXT;
