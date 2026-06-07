-- DropIndex
DROP INDEX "AILog_projectId_userId_createdAt_idx";

-- CreateIndex
CREATE INDEX "AILog_projectId_userId_createdAt_id_idx" ON "AILog"("projectId", "userId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "AgentAudit_id_projectId_userId_idx" ON "AgentAudit"("id", "projectId", "userId");

-- CreateIndex
CREATE INDEX "Archive_projectId_userId_id_idx" ON "Archive"("projectId", "userId", "id");

-- CreateIndex
CREATE INDEX "Bookmark_projectId_userId_id_idx" ON "Bookmark"("projectId", "userId", "id");

-- CreateIndex
CREATE INDEX "ChatMedia_id_userId_chatId_idx" ON "ChatMedia"("id", "userId", "chatId");
