/*
  Warnings:

  - You are about to drop the column `doctorsWithDates` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `repId` on the `Plan` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_planId_fkey";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "doctorsWithDates",
DROP COLUMN "repId",
ADD COLUMN     "doctors" JSONB[];
