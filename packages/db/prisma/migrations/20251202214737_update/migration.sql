/*
  Warnings:

  - The `status` column on the `PackImages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Packs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PackImages" DROP COLUMN "status",
ADD COLUMN     "status" "OutputImageStatusEnum" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Packs" DROP COLUMN "status",
ADD COLUMN     "status" "OutputImageStatusEnum" NOT NULL DEFAULT 'PENDING';
