import { Router, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// 👤 GET Profile (already works)
router.get("/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing from token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, name: true, email: true, isDriver: true },
    });

    res.status(200).json({ message: "✅ Profile data fetched successfully!", user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✏️ UPDATE Profile
router.put("/update", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, phone, isDriver } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing from token" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        name,
        phone,
        isDriver,
      },
      select: { id: true, name: true, email: true, phone: true, isDriver: true },
    });

    res.status(200).json({
      message: "✅ Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
