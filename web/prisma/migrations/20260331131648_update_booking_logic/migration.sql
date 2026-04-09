/*
  Warnings:

  - You are about to drop the column `number` on the `Flight` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,flightId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Flight_number_key";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "adults" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "children" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "infants" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Flight" DROP COLUMN "number",
ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 180;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_userId_flightId_key" ON "Booking"("userId", "flightId");
