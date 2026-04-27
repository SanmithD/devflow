/*
  Warnings:

  - Added the required column `userId` to the `AILog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AILog" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "AILog" ADD CONSTRAINT "AILog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
