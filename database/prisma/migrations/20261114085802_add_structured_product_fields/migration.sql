-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "includedAccessories" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "rentalInstructions" TEXT,
ADD COLUMN     "specifications" JSONB;
