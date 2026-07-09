/*
  Warnings:

  - You are about to drop the column `name` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the `Hospital` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DoctorToHospital` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DoctorToHospital" DROP CONSTRAINT "_DoctorToHospital_A_fkey";

-- DropForeignKey
ALTER TABLE "_DoctorToHospital" DROP CONSTRAINT "_DoctorToHospital_B_fkey";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "name",
ADD COLUMN     "nameAR" TEXT,
ADD COLUMN     "nameEN" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "avgPatientsPerDay" DROP NOT NULL,
ALTER COLUMN "dateOfBirth" DROP NOT NULL,
ALTER COLUMN "specialty" DROP NOT NULL,
ALTER COLUMN "LicenseNumber" DROP NOT NULL;

-- DropTable
DROP TABLE "Hospital";

-- DropTable
DROP TABLE "_DoctorToHospital";

-- CreateTable
CREATE TABLE "Accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subRegionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccountsToDoctor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AccountsToDoctor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AccountsToDoctor_B_index" ON "_AccountsToDoctor"("B");

-- AddForeignKey
ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountsToDoctor" ADD CONSTRAINT "_AccountsToDoctor_A_fkey" FOREIGN KEY ("A") REFERENCES "Accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountsToDoctor" ADD CONSTRAINT "_AccountsToDoctor_B_fkey" FOREIGN KEY ("B") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
