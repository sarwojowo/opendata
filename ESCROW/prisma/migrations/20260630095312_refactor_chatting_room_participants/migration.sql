/*
  Warnings:

  - You are about to drop the column `creator_id` on the `chatting_room` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `chatting_room` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('USER', 'CREATOR', 'ARBITER');

-- DropForeignKey
ALTER TABLE "chatting_room" DROP CONSTRAINT "chatting_room_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "chatting_room" DROP CONSTRAINT "chatting_room_user_id_fkey";

-- AlterTable
ALTER TABLE "chatting_room" DROP COLUMN "creator_id",
DROP COLUMN "user_id";

-- CreateTable
CREATE TABLE "chatting_participants" (
    "id" BIGSERIAL NOT NULL,
    "room_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "role" "ParticipantRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatting_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chatting_participants_room_id_user_id_key" ON "chatting_participants"("room_id", "user_id");

-- AddForeignKey
ALTER TABLE "chatting_participants" ADD CONSTRAINT "chatting_participants_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "chatting_room"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chatting_participants" ADD CONSTRAINT "chatting_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
