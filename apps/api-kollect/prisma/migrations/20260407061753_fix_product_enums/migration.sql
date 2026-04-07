-- CreateEnum
CREATE TYPE "PromotionScope" AS ENUM ('BRAND', 'COLLECTION');

-- AlterTable
ALTER TABLE "promo_codes" ADD COLUMN     "collectionId" TEXT,
ADD COLUMN     "isAutoApplied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scope" "PromotionScope" NOT NULL DEFAULT 'BRAND';

-- CreateIndex
CREATE INDEX "collections_brandId_status_idx" ON "collections"("brandId", "status");

-- CreateIndex
CREATE INDEX "commandes_brandId_status_idx" ON "commandes"("brandId", "status");

-- CreateIndex
CREATE INDEX "commandes_brandId_createdAt_idx" ON "commandes"("brandId", "createdAt");

-- CreateIndex
CREATE INDEX "commandes_clientId_createdAt_idx" ON "commandes"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_sentAt_idx" ON "notifications"("userId", "sentAt");

-- CreateIndex
CREATE INDEX "products_brandId_isVisible_isDeleted_idx" ON "products"("brandId", "isVisible", "isDeleted");

-- CreateIndex
CREATE INDEX "promo_codes_isAutoApplied_idx" ON "promo_codes"("isAutoApplied");

-- CreateIndex
CREATE INDEX "promo_codes_collectionId_idx" ON "promo_codes"("collectionId");

-- CreateIndex
CREATE INDEX "promo_codes_brandId_isActive_isAutoApplied_idx" ON "promo_codes"("brandId", "isActive", "isAutoApplied");

-- AddForeignKey
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
