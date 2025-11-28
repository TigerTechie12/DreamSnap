/*
  Warnings:

  - Added the required column `jobId` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ModelTrainingEnum" AS ENUM ('TRAINING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "jobId" TEXT NOT NULL,
ADD COLUMN     "status" "ModelTrainingEnum" NOT NULL DEFAULT 'TRAINING';
