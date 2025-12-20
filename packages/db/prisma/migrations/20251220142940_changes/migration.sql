/*
  Warnings:

  - The `imageUrl` column on the `Model` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `trainingImagesUrl` column on the `Model` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Model" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrl" TEXT[],
DROP COLUMN "trainingImagesUrl",
ADD COLUMN     "trainingImagesUrl" TEXT[];
