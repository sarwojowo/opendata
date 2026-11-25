/*
  Warnings:

  - The values [APPROVED] on the enum `escrow_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [NEEDS_REVISION] on the enum `order_status` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `type` to the `order_historical` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "order_history_type" AS ENUM ('DEPOSIT', 'START', 'SUBMIT', 'APPROVE', 'DISPUTE', 'RESOLVE', 'REJECT', 'REFUND');

-- AlterEnum
BEGIN;
CREATE TYPE "escrow_status_new" AS ENUM ('CREATED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'RELEASED', 'DISPUTED', 'REFUNDED');
ALTER TABLE "public"."escrows" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "escrows" ALTER COLUMN "status" TYPE "escrow_status_new" USING ("status"::text::"escrow_status_new");
ALTER TYPE "escrow_status" RENAME TO "escrow_status_old";
ALTER TYPE "escrow_status_new" RENAME TO "escrow_status";
DROP TYPE "public"."escrow_status_old";
ALTER TABLE "escrows" ALTER COLUMN "status" SET DEFAULT 'CREATED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "order_status_new" AS ENUM ('PENDING_ACCEPTANCE', 'IN_PROGRESS', 'DELIVERED', 'DISPUTED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "order_status_new" USING ("status"::text::"order_status_new");
ALTER TYPE "order_status" RENAME TO "order_status_old";
ALTER TYPE "order_status_new" RENAME TO "order_status";
DROP TYPE "public"."order_status_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING_ACCEPTANCE';
COMMIT;

-- AlterTable
ALTER TABLE "escrows" ADD COLUMN     "reject_reason" TEXT,
ADD COLUMN     "rejected_at" TIMESTAMPTZ(3),
ADD COLUMN     "rejected_by" TEXT,
ADD COLUMN     "work_deadline" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "order_historical" ADD COLUMN     "type" "order_history_type" NOT NULL;

-- CreateIndex
CREATE INDEX "escrows_status_idx" ON "escrows"("status");

-- CreateIndex
CREATE INDEX "order_historical_order_id_idx" ON "order_historical"("order_id");

-- CreateIndex
CREATE INDEX "order_historical_order_id_type_idx" ON "order_historical"("order_id", "type");
