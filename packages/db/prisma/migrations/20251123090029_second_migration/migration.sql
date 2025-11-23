/*
  Warnings:

  - You are about to drop the column `type` on the `Model` table. All the data in the column will be lost.
  - Added the required column `gender` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Model" DROP COLUMN "type",
ADD COLUMN     "gender" "ModelTypeEnum" NOT NULL;
