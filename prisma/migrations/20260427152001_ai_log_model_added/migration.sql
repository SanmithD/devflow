-- CreateTable
CREATE TABLE "AILog" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "input" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AILog_id_key" ON "AILog"("id");

-- AddForeignKey
ALTER TABLE "AILog" ADD CONSTRAINT "AILog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
