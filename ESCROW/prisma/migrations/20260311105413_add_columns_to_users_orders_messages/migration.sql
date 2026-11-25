/*
  Warnings:

  - Added the required column `content` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference_image_url` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "content" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "note" TEXT,
ADD COLUMN     "reference_image_url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "background_image_url" TEXT,
ADD COLUMN     "profile_image_url" TEXT;
