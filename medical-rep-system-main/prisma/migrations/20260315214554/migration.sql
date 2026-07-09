/*
  Warnings:

  - You are about to drop the `_ProductsToRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductsToRequest" DROP CONSTRAINT "_ProductsToRequest_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductsToRequest" DROP CONSTRAINT "_ProductsToRequest_B_fkey";

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "productsId" TEXT;

-- DropTable
DROP TABLE "_ProductsToRequest";

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_productsId_fkey" FOREIGN KEY ("productsId") REFERENCES "Products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
