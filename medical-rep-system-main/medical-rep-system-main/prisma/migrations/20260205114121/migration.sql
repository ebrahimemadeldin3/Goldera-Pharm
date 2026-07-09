/*
  Warnings:

  - You are about to drop the `_AccountsToDoctor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DoctorToSubRegion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AccountsToDoctor" DROP CONSTRAINT "_AccountsToDoctor_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccountsToDoctor" DROP CONSTRAINT "_AccountsToDoctor_B_fkey";

-- DropForeignKey
ALTER TABLE "_DoctorToSubRegion" DROP CONSTRAINT "_DoctorToSubRegion_A_fkey";

-- DropForeignKey
ALTER TABLE "_DoctorToSubRegion" DROP CONSTRAINT "_DoctorToSubRegion_B_fkey";

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountsId" TEXT,
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "subRegion" TEXT;

-- DropTable
DROP TABLE "_AccountsToDoctor";

-- DropTable
DROP TABLE "_DoctorToSubRegion";

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_accountsId_fkey" FOREIGN KEY ("accountsId") REFERENCES "Accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
