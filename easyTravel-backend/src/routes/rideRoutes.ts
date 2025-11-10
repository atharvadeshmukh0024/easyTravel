import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { createRide, getAllRides, searchRides, getMyRides } from "../controllers/rideController";

const router = express.Router();

router.post("/create", authenticateToken, createRide);
router.get("/all", getAllRides);
router.get("/search", searchRides);
router.get("/myrides", authenticateToken, getMyRides);

export default router;