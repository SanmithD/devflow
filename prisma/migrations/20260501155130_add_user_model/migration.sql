-- DropForeignKey
ALTER TABLE "AILog" DROP CONSTRAINT "AILog_projectId_fkey";

-- DropForeignKey
ALTER TABLE "AILog" DROP CONSTRAINT "AILog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- CreateTable
CREATE TABLE "AuditTrial" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT,
    "table" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditTrial_userId_id_table_idx" ON "AuditTrial"("userId", "id", "table");

-- CreateIndex
CREATE INDEX "AILog_projectId_userId_createdAt_idx" ON "AILog"("projectId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "MailRecord_userId_createdAt_idx" ON "MailRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Project_id_userId_createdAt_title_idx" ON "Project"("id", "userId", "createdAt", "title");

-- CreateIndex
CREATE INDEX "User_id_email_idx" ON "User"("id", "email");

-- CreateIndex
CREATE INDEX "UserUsage_userId_id_createdAt_idx" ON "UserUsage"("userId", "id", "createdAt");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailRecord" ADD CONSTRAINT "MailRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AILog" ADD CONSTRAINT "AILog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AILog" ADD CONSTRAINT "AILog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditTrial" ADD CONSTRAINT "AuditTrial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
