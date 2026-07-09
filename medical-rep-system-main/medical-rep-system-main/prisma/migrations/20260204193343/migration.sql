/*
  Warnings:

  - You are about to drop the column `subRegionId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_subRegionId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "subRegionId";

-- CreateTable
CREATE TABLE "_SubRegionToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubRegionToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SubRegionToUser_B_index" ON "_SubRegionToUser"("B");

-- AddForeignKey
ALTER TABLE "_SubRegionToUser" ADD CONSTRAINT "_SubRegionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "SubRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubRegionToUser" ADD CONSTRAINT "_SubRegionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
