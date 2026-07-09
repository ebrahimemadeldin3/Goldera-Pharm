/*
  Warnings:

  - You are about to drop the column `leaveDaysCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `leaveDaysTakenCount` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "leaveDaysCount",
DROP COLUMN "leaveDaysTakenCount",
ADD COLUMN     "leaveDaysCountTotal" INTEGER DEFAULT 0;
