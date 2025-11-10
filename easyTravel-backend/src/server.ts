import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/user.routes";
import rideRoutes from "./routes/rideRoutes";
import bookingRoutes from "./routes/booking.routes";
import vehicleRoutes from "./routes/vehicleRoutes"; // New import

dotenv.config();

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

// ✅ Middleware
app.use(cors());

// ✅ Routes
app.use("/api/auth", authRoutes);       // Register & Login
app.use("/api/user", userRoutes);       // User profile
app.use("/api/ride", rideRoutes);       // Ride management
app.use("/api/booking", bookingRoutes); // Booking management
app.use("/api/vehicle", vehicleRoutes); // Vehicle management (NEW)

// ✅ Test route
app.get("/", (req, res) => {
  res.send("🚀 easyTravel API is running...");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`✅ Server running on port ${PORT}`);
    console.log("📦 Connected to database successfully!");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
  }
});