/*
  Warnings:

  - A unique constraint covering the columns `[orderDate]` on the table `Sales` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Sales_orderDate_key" ON "Sales"("orderDate");
