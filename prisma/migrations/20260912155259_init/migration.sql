-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "applicationNumber" TEXT,
    "uid" TEXT,
    "email" TEXT,
    "department" TEXT NOT NULL,
    "semester" TEXT,
    "phone" TEXT,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryStatus" TEXT NOT NULL DEFAULT 'NOT ENTERED',
    "entryTimestamp" TIMESTAMP(3),

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_applicationNumber_key" ON "Participant"("applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_uid_key" ON "Participant"("uid");
