/*
  Warnings:

  - The `status` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[rideId,passengerId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "status" "RideStatus" NOT NULL DEFAULT 'SCHEDULED';

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "driverId" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE INDEX "Vehicle_driverId_idx" ON "Vehicle"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Booking_rideId_idx" ON "Booking"("rideId");

-- CreateIndex
CREATE INDEX "Booking_passengerId_idx" ON "Booking"("passengerId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_rideId_passengerId_key" ON "Booking"("rideId", "passengerId");

-- CreateIndex
CREATE INDEX "Ride_date_origin_destination_idx" ON "Ride"("date", "origin", "destination");

-- CreateIndex
CREATE INDEX "Ride_driverId_idx" ON "Ride"("driverId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
