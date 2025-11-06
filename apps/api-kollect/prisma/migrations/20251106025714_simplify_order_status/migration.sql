/*
  Warnings:

  - The values [EN_PREPARATION,PRETE_A_LIVRAISON,EN_LIVRAISON,RETOURNEE,REMBOURSEE] on the enum `CommandeStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CommandeStatus_new" AS ENUM ('EN_ATTENTE', 'CONFIRMEE', 'LIVREE', 'ANNULEE');
ALTER TABLE "public"."commandes" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "commandes" ALTER COLUMN "status" TYPE "CommandeStatus_new" USING ("status"::text::"CommandeStatus_new");
ALTER TABLE "commande_status_history" ALTER COLUMN "status" TYPE "CommandeStatus_new" USING ("status"::text::"CommandeStatus_new");
ALTER TYPE "CommandeStatus" RENAME TO "CommandeStatus_old";
ALTER TYPE "CommandeStatus_new" RENAME TO "CommandeStatus";
DROP TYPE "public"."CommandeStatus_old";
ALTER TABLE "commandes" ALTER COLUMN "status" SET DEFAULT 'EN_ATTENTE';
COMMIT;
