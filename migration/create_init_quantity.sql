ALTER TABLE "suppliedProducts" ADD COLUMN "initQuantity" integer DEFAULT null;
UPDATE "suppliedProducts" SET "initQuantity" = "quantity";