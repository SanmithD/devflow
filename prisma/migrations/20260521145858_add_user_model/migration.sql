-- CreateTable
CREATE TABLE "ChatMedia" (
    "id" SERIAL NOT NULL,
    "url" TEXT,
    "type" TEXT,
    "name" TEXT,
    "format" TEXT,
    "size" TEXT,
    "chatId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatMedia" ADD CONSTRAINT "ChatMedia_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "AILog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMedia" ADD CONSTRAINT "ChatMedia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
