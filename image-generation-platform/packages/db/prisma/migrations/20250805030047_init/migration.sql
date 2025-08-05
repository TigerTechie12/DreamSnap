-- CreateEnum
CREATE TYPE "ModelTrainingStatusEnum" AS ENUM ('Pending', 'generated', 'Failed');

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "tensorPath" TEXT,
ADD COLUMN     "trainingStatus" "ModelTrainingStatusEnum" NOT NULL DEFAULT 'Pending',
ADD COLUMN     "triggerWord" TEXT;
