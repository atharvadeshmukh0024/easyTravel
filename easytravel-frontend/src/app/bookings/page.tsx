"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Booking = {
  id: number;
  status: string;
  createdAt: string;
  ride: {
    id: number;
    origin: string;
    destination: string;
    date: string;
    price: number;
    status: string;
    driver: {
      id: number;
      name: string;
      phone: string | null;
      vehicles: Array<{
        make: string;
        model: string;
        color: string;
        licensePlate: string;
      }>;
    };
  };
  review?: {
    id: number;
    rating: number;
    comment: string | null;
    createdAt: string;
  } | null;
};

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const res = await fetch("http://localhost:5000/api/booking/my-bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch bookings");

      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/booking/cancel/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to cancel booking");
      }

      alert("✅ Booking cancelled successfully!");
      fetchBookings(); // Refresh the list
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    }
  };

  const openReviewModal = (bookingId: number) => {
    setSelectedBooking(bookingId);
    setRating(5);
    setComment("");
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedBooking) return;

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/booking/review/${selectedBooking}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add review");

      alert("✅ Review added successfully!");
      setShowReviewModal(false);
      fetchBookings(); // Refresh to show new review
    } catch (err: any) {
      alert(err.message || "Failed to add review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED": return "bg-blue-100 text-blue-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return "⏳";
      case "CONFIRMED": return "✅";
      case "COMPLETED": return "🎉";
      case "CANCELLED": return "❌";
      default: return "📋";
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Bookings 🎫</h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              ← Back
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚗</div>
              <p className="text-gray-600 text-lg mb-4">You have no bookings yet.</p>
              <button
                onClick={() => router.push("/rides")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Find Rides
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow bg-white"
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)} {booking.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Booked: {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Route Info */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-lg font-semibold mb-2">
                      <span className="text-green-600">{booking.ride.origin}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-blue-600">{booking.ride.destination}</span>
                    </div>
                    <p className="text-gray-600">
                      📅 {new Date(booking.ride.date).toLocaleDateString()} at{" "}
                      {new Date(booking.ride.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Driver Info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="font-semibold text-gray-700 mb-1">
                      👤 Driver: {booking.ride.driver.name}
                    </p>
                    {booking.ride.driver.phone && (
                      <p className="text-sm text-gray-600">
                        📞 {booking.ride.driver.phone}
                      </p>
                    )}
                    {booking.ride.driver.vehicles.length > 0 && (
                      <p className="text-sm text-gray-600">
                        🚗 {booking.ride.driver.vehicles[0].make}{" "}
                        {booking.ride.driver.vehicles[0].model} ({booking.ride.driver.vehicles[0].color})
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <p className="text-2xl font-bold text-green-600">₹{booking.ride.price}</p>
                  </div>

                  {/* Review Section */}
                  {booking.review ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                      <p className="font-semibold text-gray-700 mb-1">Your Review:</p>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-yellow-500">
                          {"⭐".repeat(booking.review.rating)}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({booking.review.rating}/5)
                        </span>
                      </div>
                      {booking.review.comment && (
                        <p className="text-sm text-gray-600 italic">"{booking.review.comment}"</p>
                      )}
                    </div>
                  ) : booking.status === "COMPLETED" ? (
                    <button
                      onClick={() => openReviewModal(booking.id)}
                      className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition font-semibold"
                    >
                      ⭐ Leave a Review
                    </button>
                  ) : null}

                  {/* Action Buttons */}
                  {booking.status === "PENDING" && (
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      className="w-full mt-3 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {booking.status === "CANCELLED" && (
                    <p className="text-center text-red-600 mt-3 font-semibold">
                      This booking was cancelled
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Leave a Review ⭐</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Rating (1-5 stars)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl transition ${
                      star <= rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">Selected: {rating} stars</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                disabled={submittingReview}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={submittingReview}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}