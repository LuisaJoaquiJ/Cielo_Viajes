-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'SENT', 'REFUNDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RefundFileType" AS ENUM ('TICKET', 'REEMBOLSO', 'PAGO_CLIENTE', 'COMPROBANTE', 'CORREO', 'OTRO');

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "passengerName" TEXT NOT NULL,
    "pnr" TEXT NOT NULL,
    "caseNumber" TEXT,
    "airline" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "customerPaid" DECIMAL(12,2) NOT NULL,
    "refundReceived" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "refundDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_segments" (
    "id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "ticketPrice" DECIMAL(12,2) NOT NULL,
    "refundOptionPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refundId" TEXT NOT NULL,

    CONSTRAINT "refund_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_files" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" "RefundFileType" NOT NULL DEFAULT 'OTRO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refundId" TEXT NOT NULL,

    CONSTRAINT "refund_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_history" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refundId" TEXT NOT NULL,

    CONSTRAINT "refund_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "refund_segments" ADD CONSTRAINT "refund_segments_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "refunds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_files" ADD CONSTRAINT "refund_files_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "refunds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_history" ADD CONSTRAINT "refund_history_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "refunds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
