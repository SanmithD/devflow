-- AlterTable
ALTER TABLE "AILog" ADD COLUMN     "ipAddress" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "title" TEXT;
