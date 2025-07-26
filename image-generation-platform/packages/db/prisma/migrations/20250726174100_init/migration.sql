/*
  Warnings:

  - Changed the type of `ethinicity` on the `Model` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EthinicityEnum" AS ENUM ('White', 'Black', 'Asian American', 'East Asian', 'South East Asian', 'South Asian', 'Middle Eastern', 'Pacific', 'Hispanic');

-- AlterTable
ALTER TABLE "Model" DROP COLUMN "ethinicity",
ADD COLUMN     "ethinicity" "EthinicityEnum" NOT NULL;

-- DropEnum
DROP TYPE "EthenecityEnum";
