/*
  Warnings:

  - You are about to drop the column `escrow_address` on the `orders` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "orders_escrow_address_key";

-- AlterTable
ALTER TABLE "escrows" ALTER COLUMN "status" SET DEFAULT 'CREATED';

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "escrow_address";
