import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { 
  bookRide, 
  getMyBookings, 
  cancelBooking,
  updateBookingStatus,
  addReview,
  getDriverReviews
} from "../controllers/booking.controller";

const router = express.Router();

// 🎫 Booking Management
router.post("/book", authenticateToken, bookRide);
router.get("/my-bookings", authenticateToken, getMyBookings);
router.patch("/status/:bookingId", authenticateToken, updateBookingStatus);
router.delete("/cancel/:bookingId", authenticateToken, cancelBooking);

// ⭐ Review Management
router.post("/review/:bookingId", authenticateToken, addReview);
router.get("/driver-reviews/:driverId", getDriverReviews); // No auth needed - public reviews

export default router;