import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// 🚗 Add a vehicle (Driver only)
export const addVehicle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { make, model, year, color, licensePlate } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Check if user is a driver
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.isDriver) {
      return res.status(403).json({ message: "Only drivers can add vehicles" });
    }

    // Check for duplicate license plate
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { licensePlate },
    });

    if (existingVehicle) {
      return res.status(400).json({ message: "License plate already registered" });
    }

    // Create vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        driverId: userId,
        make,
        model,
        year: parseInt(year),
        color,
        licensePlate,
      },
    });

    res.status(201).json({
      message: "✅ Vehicle added successfully",
      vehicle,
    });
  } catch (error) {
    console.error("Error adding vehicle:", error);
    res.status(500).json({ message: "Server error", error: String(error) });
  }
};

// 📋 Get all vehicles for logged-in driver
export const getMyVehicles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { driverId: userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "✅ Vehicles fetched successfully",
      vehicles,
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ Update vehicle
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { vehicleId } = req.params;
    const { make, model, year, color, licensePlate } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Check vehicle ownership
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number(vehicleId) },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.driverId !== userId) {
      return res.status(403).json({ message: "You can only update your own vehicles" });
    }

    // Update vehicle
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: Number(vehicleId) },
      data: {
        ...(make && { make }),
        ...(model && { model }),
        ...(year && { year: parseInt(year) }),
        ...(color && { color }),
        ...(licensePlate && { licensePlate }),
      },
    });

    res.status(200).json({
      message: "✅ Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ Delete vehicle
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { vehicleId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Check vehicle ownership
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number(vehicleId) },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.driverId !== userId) {
      return res.status(403).json({ message: "You can only delete your own vehicles" });
    }

    // Delete vehicle
    await prisma.vehicle.delete({
      where: { id: Number(vehicleId) },
    });

    res.status(200).json({ message: "✅ Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ message: "Server error" });
  }
};