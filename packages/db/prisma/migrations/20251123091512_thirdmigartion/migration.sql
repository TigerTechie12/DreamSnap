/*
  Warnings:

  - The values [SouthAsianMiddle,Eastern] on the enum `EthinictyEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EthinictyEnum_new" AS ENUM ('White', 'Black', 'AsianAmerican', 'EastAsian', 'SouthEastAsian', 'SouthAsianMiddleEastern', 'Pacific', 'Hispanic');
ALTER TABLE "Model" ALTER COLUMN "ethinicity" TYPE "EthinictyEnum_new" USING ("ethinicity"::text::"EthinictyEnum_new");
ALTER TYPE "EthinictyEnum" RENAME TO "EthinictyEnum_old";
ALTER TYPE "EthinictyEnum_new" RENAME TO "EthinictyEnum";
DROP TYPE "EthinictyEnum_old";
COMMIT;
