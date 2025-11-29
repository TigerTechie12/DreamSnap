/*
  Warnings:

  - Added the required column `jobid` to the `OutputImages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OutputImages" ADD COLUMN     "jobid" TEXT NOT NULL;
