/*
  Warnings:

  - Added the required column `sheetName` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Sales_orderDate_key";

-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "sheetName" TEXT NOT NULL;
