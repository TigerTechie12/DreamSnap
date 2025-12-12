/*
  Warnings:

  - You are about to drop the column `userid` on the `OutputImages` table. All the data in the column will be lost.
  - Added the required column `userId` to the `OutputImages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OutputImages" DROP CONSTRAINT "OutputImages_userid_fkey";

-- AlterTable
ALTER TABLE "OutputImages" DROP COLUMN "userid",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "OutputImages" ADD CONSTRAINT "OutputImages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
