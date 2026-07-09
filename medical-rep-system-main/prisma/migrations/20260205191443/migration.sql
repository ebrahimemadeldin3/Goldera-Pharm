/*
  Warnings:

  - You are about to drop the `_SubRegionToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SubRegionToUser" DROP CONSTRAINT "_SubRegionToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubRegionToUser" DROP CONSTRAINT "_SubRegionToUser_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subRegionId" TEXT;

-- DropTable
DROP TABLE "_SubRegionToUser";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
