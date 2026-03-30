ALTER TABLE "commandes"
ADD COLUMN "shippingName" VARCHAR(150),
ADD COLUMN "notes" TEXT;

UPDATE "commandes"
SET "shippingName" = COALESCE(TRIM(CONCAT(u."firstName", ' ', u."lastName")), 'Client')
FROM "users" u
WHERE u.id = "commandes"."clientId"
  AND "commandes"."shippingName" IS NULL;

UPDATE "commandes"
SET "shippingName" = 'Client'
WHERE "shippingName" IS NULL OR BTRIM("shippingName") = '';

ALTER TABLE "commandes"
ALTER COLUMN "shippingName" SET NOT NULL;
