/*
  Warnings:

  - You are about to drop the column `personalExpenseData` on the `Request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "personalExpenseData",
ADD COLUMN     "pdfs" JSONB[],
ADD COLUMN     "totalExpenseAmount" DOUBLE PRECISION;
