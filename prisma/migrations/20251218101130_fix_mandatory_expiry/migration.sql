/*
  Warnings:

  - Made the column `expiresAt` on table `StockLot` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StockLot" ALTER COLUMN "expiresAt" SET NOT NULL;

-- CreateIndex
CREATE INDEX "StockLot_expiresAt_idx" ON "StockLot"("expiresAt");
