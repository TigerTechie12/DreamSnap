/*
  Warnings:

  - You are about to drop the column `numberOfImages` on the `OutputImages` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfPacks` on the `Packs` table. All the data in the column will be lost.
  - Added the required column `numberOfImages` to the `Model` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfPacks` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "numberOfImages" INTEGER NOT NULL,
ADD COLUMN     "numberOfPacks" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OutputImages" DROP COLUMN "numberOfImages";

-- AlterTable
ALTER TABLE "Packs" DROP COLUMN "numberOfPacks";
