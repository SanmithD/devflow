-- CreateTable
CREATE TABLE "MailRecord" (
    "id" SERIAL NOT NULL,
    "table" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MailRecord_pkey" PRIMARY KEY ("id")
);
