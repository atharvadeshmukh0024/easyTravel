import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// 🚗 Create a ride (Driver only)
export const createRide = async (req: any, res: Response) => {
  try {
    const { origin, destination, date, time, price, seatsAvailable } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const driver = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!driver?.isDriver) {
      return res
        .status(403)
        .json({ message: "Only drivers can create rides." });
    }

    // 🕒 Combine date and time into a single Date object
    const dateTime = new Date(`${date}T${time}:00`);

    const ride = await prisma.ride.create({
      data: {
        driverId: req.user.id,
        origin,
        destination,
        date: dateTime,
        price: parseFloat(price),
        seatsAvailable: parseInt(seatsAvailable, 10),
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicles: {
              select: {
                id: true,
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

    res.status(201).json({ message: "✅ Ride created successfully!", ride });
  } catch (error) {
    console.error("Error creating ride:", error);
    res.status(500).json({ message: "Server error", error: String(error) });
  }
};

// 🧭 Get all available rides (for passengers)
export const getAllRides = async (req: Request, res: Response) => {
  try {
    const rides = await prisma.ride.findMany({
      where: {
        status: "SCHEDULED",
        seatsAvailable: { gt: 0 },
      },
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
        bookings: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });
    res.status(200).json({ rides });
  } catch (error) {
    console.error("Error fetching rides:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Search rides
export const searchRides = async (req: Request, res: Response) => {
  try {
    const { source, destination } = req.query;

    if (!source || !destination) {
      return res.status(400).json({ message: "Source and destination are required" });
    }

    const rides = await prisma.ride.findMany({
      where: {
        origin: { contains: source as string, mode: "insensitive" },
        destination: { contains: destination as string, mode: "insensitive" },
        status: "SCHEDULED",
        seatsAvailable: { gt: 0 },
      },
      include: {
        driver: {
          select: {
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
      orderBy: { date: "asc" },
    });

    if (rides.length === 0) {
      return res.status(404).json({ message: "No rides found" });
    }

    res.json({ rides });
  } catch (error) {
    console.error("Error searching rides:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all rides created by the logged-in driver
export const getMyRides = async (req: Request, res: Response) => {
  try {
    const driverId = (req as any).user.id;
    const rides = await prisma.ride.findMany({
      where: { driverId },
      include: {
        bookings: {
          include: {
            passenger: { select: { name: true, phone: true } },
            review: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    res.status(200).json({ rides });
  } catch (error) {
    console.error("Error fetching driver rides:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔄 Update ride status
export const updateRideStatus = async (req: Request, res: Response) => {
  try {
    const driverId = (req as any).user?.id;
    const { rideId } = req.params;
    const { status } = req.body;

    if (!driverId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Verify ride ownership
    const ride = await prisma.ride.findUnique({
      where: { id: Number(rideId) },
    });

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driverId !== driverId) {
      return res.status(403).json({ message: "You can only update your own rides" });
    }

    // Update ride status
    const updatedRide = await prisma.ride.update({
      where: { id: Number(rideId) },
      data: { status },
    });

    // If ride is completed, mark all confirmed bookings as completed
    if (status === "COMPLETED") {
      await prisma.booking.updateMany({
        where: {
          rideId: Number(rideId),
          status: "CONFIRMED",
        },
        data: {
          status: "COMPLETED",
        },
      });
    }

    res.status(200).json({
      message: "✅ Ride status updated",
      ride: updatedRide,
    });
  } catch (error) {
    console.error("Error updating ride status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ Delete ride
export const deleteRide = async (req: Request, res: Response) => {
  try {
    const driverId = (req as any).user?.id;
    const { rideId } = req.params;

    if (!driverId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Verify ride ownership
    const ride = await prisma.ride.findUnique({
      where: { id: Number(rideId) },
      include: { bookings: true },
    });

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driverId !== driverId) {
      return res.status(403).json({ message: "You can only delete your own rides" });
    }

    // Check if ride has bookings
    if (ride.bookings.length > 0) {
      return res.status(400).json({
        message: "Cannot delete ride with existing bookings. Cancel the ride instead.",
      });
    }

    // Delete ride
    await prisma.ride.delete({
      where: { id: Number(rideId) },
    });

    res.status(200).json({ message: "✅ Ride deleted successfully" });
  } catch (error) {
    console.error("Error deleting ride:", error);
    res.status(500).json({ message: "Server error" });
  }
};