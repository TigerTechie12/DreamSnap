/*
  Warnings:

  - You are about to drop the column `numberOfImages` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfPacks` on the `Model` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Model" DROP COLUMN "numberOfImages",
DROP COLUMN "numberOfPacks";
