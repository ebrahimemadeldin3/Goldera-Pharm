/*
  Warnings:

  - You are about to drop the column `regionId` on the `Pharmacy` table. All the data in the column will be lost.
  - You are about to drop the column `subRegionId` on the `Pharmacy` table. All the data in the column will be lost.
  - Added the required column `region` to the `Pharmacy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subRegion` to the `Pharmacy` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Pharmacy" DROP CONSTRAINT "Pharmacy_regionId_fkey";

-- DropForeignKey
ALTER TABLE "Pharmacy" DROP CONSTRAINT "Pharmacy_subRegionId_fkey";

-- AlterTable
ALTER TABLE "Pharmacy" DROP COLUMN "regionId",
DROP COLUMN "subRegionId",
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "subRegion" TEXT NOT NULL;
