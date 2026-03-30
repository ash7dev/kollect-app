-- AlterTable
ALTER TABLE "collections"
ADD COLUMN "endDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "collections_endDate_idx" ON "collections"("endDate");
