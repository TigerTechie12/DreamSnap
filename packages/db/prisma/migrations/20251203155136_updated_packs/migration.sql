/*
  Warnings:

  - Added the required column `jobId` to the `Packs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PackImages" ADD COLUMN     "jobId" TEXT;

-- AlterTable
ALTER TABLE "Packs" ADD COLUMN     "jobId" TEXT NOT NULL;
