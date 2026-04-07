-- Créer les types énumérés s'ils n'existent pas
DO $$ BEGIN
    CREATE TYPE "ProductGender" AS ENUM ('HOMME', 'FEMME', 'UNISEXE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ProductType" AS ENUM ('TSHIRT', 'BONNET', 'SAC', 'ENSEMBLE', 'ACCESSOIRE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mettre à jour les colonnes pour utiliser les énumérations
-- D'abord, on s'assure que toutes les valeurs existantes sont valides
UPDATE "products" SET "productType" = 'TSHIRT' WHERE "productType" IS NULL OR "productType" NOT IN ('TSHIRT', 'BONNET', 'SAC', 'ENSEMBLE', 'ACCESSOIRE');
UPDATE "products" SET "gender" = 'UNISEXE' WHERE "gender" IS NULL OR "gender" NOT IN ('HOMME', 'FEMME', 'UNISEXE');

-- Modifier les colonnes pour utiliser les énumérations
ALTER TABLE "products" ALTER COLUMN "productType" TYPE "ProductType" USING "productType"::text::"ProductType";
ALTER TABLE "products" ALTER COLUMN "gender" TYPE "ProductGender" USING "gender"::text::"ProductGender";
