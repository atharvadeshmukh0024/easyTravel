import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// 🎟️ Book a ride
export const bookRide = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { rideId } = req.body;

    if (!userId) return res.status(400).json({ message: "User not authenticated" });
    if (!rideId) return res.status(400).json({ message: "Ride ID is required" });

    const ride = await prisma.ride.findUnique({
      where: { id: Number(rideId) },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicles: {
              select: {
                make: true,
                model: true,
                year: true,
                color: true,
                licensePlate: true,
              },
            },
          },
        },
      },
    });

    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.seatsAvailable <= 0)
      return res.status(400).json({ message: "No seats available" });

    // Prevent driver from booking their own ride
    if (ride.driverId === userId) {
      return res.status(400).json({ message: "You cannot book your own ride" });
    }

    // Prevent double booking
    const existingBooking = await prisma.booking.findFirst({
      where: { passengerId: userId, rideId: Number(rideId) },
    });
    if (existingBooking)
      return res.status(400).json({ message: "You already booked this ride" });

    // Create booking and update seat count in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          rideId: Number(rideId),
          passengerId: userId,
        },
        include: {
          ride: {
            include: {
              driver: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  vehicles: true,
                },
              },
            },
          },
        },
      });

      // Update seat count
      await tx.ride.update({
        where: { id: Number(rideId) },
        data: { seatsAvailable: { decrement: 1 } },
      });

      return newBooking;
    });

    res.status(201).json({ message: "✅ Ride booked successfully", booking });
  } catch (error) {
    console.error("Error booking ride:", error);
    res.status(500).json({ message: "Server error", error: String(error) });
  }
};

// 📋 Get all bookings for a user
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(400).json({ message: "User not authenticated" });

    const bookings = await prisma.booking.findMany({
      where: { passengerId: userId },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                phone: true,
                vehicles: {
                  select: {
                    make: true,
                    model: true,
                    year: true,
                    color: true,
                    licensePlate: true,
                  },
                },
              },
            },
          },
        },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ message: "✅ Your bookings fetched", bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ Cancel a booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { bookingId } = req.params;

    if (!userId) return res.status(400).json({ message: "User not authenticated" });

    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.passengerId !== userId)
      return res.status(403).json({ message: "You can only cancel your own bookings" });

    // Check if booking is already completed
    if (booking.status === "COMPLETED") {
      return res.status(400).json({ message: "Cannot cancel completed bookings" });
    }

    // ✅ Run delete + seat increment in a transaction
    await prisma.$transaction([
      prisma.booking.delete({ where: { id: Number(bookingId) } }),
      prisma.ride.update({
        where: { id: booking.rideId },
        data: { seatsAvailable: { increment: 1 } },
      }),
    ]);

    res.status(200).json({ message: "✅ Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔄 Update booking status (Driver only)
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!userId) return res.status(400).json({ message: "User not authenticated" });

    // Validate status
    const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    // Get booking with ride info
    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: {
        ride: true,
        passenger: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only the driver of the ride can update booking status
    if (booking.ride.driverId !== userId) {
      return res
        .status(403)
        .json({ message: "Only the ride driver can update booking status" });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: { status },
      include: {
        passenger: {
          select: { name: true, phone: true },
        },
        ride: {
          select: {
            origin: true,
            destination: true,
            date: true,
          },
        },
      },
    });

    res.status(200).json({
      message: `✅ Booking status updated to ${status}`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ⭐ Add review for a booking
export const addReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { bookingId } = req.params;
    const { rating, comment } = req.body;

    if (!userId) return res.status(400).json({ message: "User not authenticated" });

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: {
        ride: {
          include: {
            driver: {
              select: { id: true, name: true },
            },
          },
        },
        review: true,
      },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only the passenger can review
    if (booking.passengerId !== userId) {
      return res.status(403).json({ message: "You can only review your own bookings" });
    }

    // Check if ride is completed
    if (booking.status !== "COMPLETED") {
      return res.status(400).json({ message: "Can only review completed rides" });
    }

    // Check if review already exists
    if (booking.review) {
      return res.status(400).json({ message: "You already reviewed this ride" });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId: Number(bookingId),
        rating: parseInt(rating),
        comment: comment || null,
      },
      include: {
        booking: {
          include: {
            ride: {
              include: {
                driver: {
                  select: { id: true, name: true },
                },
              },
            },
            passenger: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: "✅ Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📊 Get all reviews for a specific driver
export const getDriverReviews = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;

    // Get all reviews for rides created by this driver
    const reviews = await prisma.review.findMany({
      where: {
        booking: {
          ride: {
            driverId: Number(driverId),
          },
        },
      },
      include: {
        booking: {
          include: {
            passenger: {
              select: { id: true, name: true },
            },
            ride: {
              select: {
                id: true,
                origin: true,
                destination: true,
                date: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    // Count ratings by star
    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    res.status(200).json({
      message: "✅ Driver reviews fetched",
      driverId: Number(driverId),
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratingDistribution,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching driver reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};