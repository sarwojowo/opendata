-- CreateEnum
CREATE TYPE "escrow_status" AS ENUM ('CREATED', 'FUNDED', 'SUBMITTED', 'APPROVED', 'RELEASED', 'DISPUTED', 'REFUNDED');

-- CreateTable
CREATE TABLE "escrows" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "escrow_address" TEXT NOT NULL,
    "client_address" TEXT NOT NULL,
    "artist_address" TEXT NOT NULL,
    "arbiter_address" TEXT NOT NULL,
    "amount" DECIMAL(36,18) NOT NULL,
    "status" "escrow_status" NOT NULL DEFAULT 'FUNDED',
    "review_deadline" TIMESTAMPTZ(3),
    "tx_hash" TEXT,
    "submission_url" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "escrows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "escrows_order_id_key" ON "escrows"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "escrows_escrow_address_key" ON "escrows"("escrow_address");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_service_id_idx" ON "orders"("service_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
