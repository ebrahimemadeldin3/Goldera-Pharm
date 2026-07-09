-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "budget" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "_DoctorToRequest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DoctorToRequest_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductsToRequest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductsToRequest_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DoctorToRequest_B_index" ON "_DoctorToRequest"("B");

-- CreateIndex
CREATE INDEX "_ProductsToRequest_B_index" ON "_ProductsToRequest"("B");

-- AddForeignKey
ALTER TABLE "_DoctorToRequest" ADD CONSTRAINT "_DoctorToRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoctorToRequest" ADD CONSTRAINT "_DoctorToRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductsToRequest" ADD CONSTRAINT "_ProductsToRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductsToRequest" ADD CONSTRAINT "_ProductsToRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
