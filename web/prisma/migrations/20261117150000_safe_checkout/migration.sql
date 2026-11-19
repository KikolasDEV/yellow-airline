ALTER TABLE "Booking" ADD COLUMN "selectedSeats" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "totalAmount" INTEGER;

CREATE TABLE "CheckoutOrder" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "User"("id"),
  "flightId" INTEGER NOT NULL REFERENCES "Flight"("id"),
  "bookingId" INTEGER UNIQUE REFERENCES "Booking"("id"),
  "status" TEXT NOT NULL DEFAULT 'CREATING',
  "stripeSessionId" TEXT UNIQUE,
  "adults" INTEGER NOT NULL,
  "children" INTEGER NOT NULL,
  "infants" INTEGER NOT NULL,
  "selectedSeats" TEXT[] NOT NULL,
  "basePrice" DOUBLE PRECISION NOT NULL,
  "unitAmount" INTEGER NOT NULL,
  "seatAmount" INTEGER NOT NULL,
  "amountTotal" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'eur',
  "appUrl" TEXT NOT NULL,
  "environment" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CheckoutOrder_passengers_check" CHECK (
    "adults" >= 1 AND "children" >= 0 AND "infants" >= 0
    AND "adults" + "children" + "infants" <= 9 AND "infants" <= "adults"
  ),
  CONSTRAINT "CheckoutOrder_amount_check" CHECK ("unitAmount" > 0 AND "seatAmount" >= 0 AND "amountTotal" > 0),
  CONSTRAINT "CheckoutOrder_status_check" CHECK ("status" IN ('CREATING', 'OPEN', 'PAID', 'EXPIRED', 'REVIEW'))
);
CREATE INDEX "CheckoutOrder_flightId_status_idx" ON "CheckoutOrder"("flightId", "status");
CREATE INDEX "CheckoutOrder_userId_flightId_status_idx" ON "CheckoutOrder"("userId", "flightId", "status");

CREATE TABLE "FlightSeat" (
  "flightId" INTEGER NOT NULL REFERENCES "Flight"("id"),
  "number" TEXT NOT NULL,
  "orderId" TEXT NOT NULL REFERENCES "CheckoutOrder"("id"),
  PRIMARY KEY ("flightId", "number")
);
CREATE INDEX "FlightSeat_orderId_idx" ON "FlightSeat"("orderId");

CREATE TABLE "RateLimitBucket" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "count" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "RateLimitBucket_expiresAt_idx" ON "RateLimitBucket"("expiresAt");
