/*
  Warnings:

  - You are about to drop the column `name` on the `Packs` table. All the data in the column will be lost.
  - You are about to drop the `PackPrompts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `modelId` to the `Packs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packType` to the `Packs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Packs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalImages` to the `Packs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Packs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Packs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PackPrompts" DROP CONSTRAINT "PackPrompts_packId_fkey";

-- AlterTable
ALTER TABLE "Packs" DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modelId" TEXT NOT NULL,
ADD COLUMN     "packType" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "totalImages" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "PackPrompts";

-- CreateTable
CREATE TABLE "PackImages" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "prompts" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "falRequestId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackImages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Packs" ADD CONSTRAINT "Packs_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackImages" ADD CONSTRAINT "PackImages_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
