import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  addVehicle,
  getMyVehicles,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController";

const router = express.Router();

// 🚗 Add vehicle (driver only)
router.post("/add", authenticateToken, addVehicle);

// 📋 Get my vehicles
router.get("/my-vehicles", authenticateToken, getMyVehicles);

// ✏️ Update vehicle
router.put("/:vehicleId", authenticateToken, updateVehicle);

// ❌ Delete vehicle
router.delete("/:vehicleId", authenticateToken, deleteVehicle);

export default router;