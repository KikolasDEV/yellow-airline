-- AlterTable
ALTER TABLE "Booking"
ADD COLUMN "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "finalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'eur',
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN "bookingReference" TEXT,
ADD COLUMN "stripeSessionId" TEXT,
ADD COLUMN "seatNumber" TEXT,
ADD COLUMN "gate" TEXT,
ADD COLUMN "boardingGroup" TEXT;

-- Backfill booking references for existing bookings
UPDATE "Booking"
SET "bookingReference" = 'YA-' || UPPER(SUBSTRING(MD5(RANDOM()::text || "id"::text) FROM 1 FOR 8))
WHERE "bookingReference" IS NULL;

-- Enforce constraints
ALTER TABLE "Booking"
ALTER COLUMN "bookingReference" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingReference_key" ON "Booking"("bookingReference");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripeSessionId_key" ON "Booking"("stripeSessionId");
