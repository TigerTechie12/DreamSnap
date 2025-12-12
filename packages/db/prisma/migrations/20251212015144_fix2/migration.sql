/*
  Warnings:

  - You are about to drop the column `numberOfImages` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfPacks` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "numberOfImages",
DROP COLUMN "numberOfPacks";
