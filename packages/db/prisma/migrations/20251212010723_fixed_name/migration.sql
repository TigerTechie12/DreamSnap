/*
  Warnings:

  - You are about to drop the column `numberOfModels` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "numberOfModels",
ADD COLUMN     "numberOfImages" INTEGER NOT NULL DEFAULT 0;
