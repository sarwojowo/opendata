/*
  Warnings:

  - A unique constraint covering the columns `[escrow_address]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `escrow_address` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "escrow_address" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_escrow_address_key" ON "orders"("escrow_address");
