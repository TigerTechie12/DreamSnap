/*
  Warnings:

  - Added the required column `numberOfPacks` to the `Packs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Packs" ADD COLUMN     "numberOfPacks" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Packs" ADD CONSTRAINT "Packs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
