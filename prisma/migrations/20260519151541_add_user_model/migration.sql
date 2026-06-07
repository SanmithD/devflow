-- CreateTable
CREATE TABLE "AgentAudit" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "input" TEXT,
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentAudit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AgentAudit" ADD CONSTRAINT "AgentAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAudit" ADD CONSTRAINT "AgentAudit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAudit" ADD CONSTRAINT "AgentAudit_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "AILog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
