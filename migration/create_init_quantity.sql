ALTER TABLE "suppliedProducts" ADD COLUMN "initQuantity" integer DEFAULT null;
UPDATE "suppliedProducts" SET "initQuantity" = "quantity";
ALTER TABLE "suppliedProducts" ADD COLUMN "initBoxSize" integer DEFAULT null;
UPDATE "suppliedProducts" SET "initBoxSize" = "boxSize";