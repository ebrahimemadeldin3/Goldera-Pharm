-- DropIndex
DROP INDEX "Products_internalRef_key";

-- CreateTable
CREATE TABLE "Sales" (
    "id" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "order" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "product" TEXT NOT NULL,
    "qtyOrdered" INTEGER NOT NULL,
    "untaxedTotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("id")
);
