/*
  Warnings:

  - You are about to drop the column `kindeId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[supabaseId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('PRODUCT', 'COLLECTION', 'BRAND');

-- DropIndex
DROP INDEX "users_kindeId_idx";

-- DropIndex
DROP INDEX "users_kindeId_key";

-- AlterTable
ALTER TABLE "commandes" ALTER COLUMN "shippingFee" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "kindeId",
ADD COLUMN     "supabaseId" TEXT;

-- CreateTable
CREATE TABLE "share_actions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "ShareType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "share_actions_type_targetId_idx" ON "share_actions"("type", "targetId");

-- CreateIndex
CREATE INDEX "share_actions_userId_idx" ON "share_actions"("userId");

-- CreateIndex
CREATE INDEX "share_actions_createdAt_idx" ON "share_actions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseId_key" ON "users"("supabaseId");

-- CreateIndex
CREATE INDEX "users_supabaseId_idx" ON "users"("supabaseId");

-- AddForeignKey
ALTER TABLE "share_actions" ADD CONSTRAINT "share_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
