"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Ride = {
  id: number;
  origin: string;
  destination: string;
  date: string;
  price: number;
  seatsAvailable: number;
  status: string;
  driver: {
    id: number;
    name: string;
    phone: string | null;
    vehicles: Array<{
      make: string;
      model: string;
      year: number;
      color: string;
      licensePlate: string;
    }>;
  };
};

type DriverReviews = {
  totalReviews: number;
  averageRating: string;
  reviews: Array<{
    rating: number;
    comment: string | null;
  }>;
};

export default function RidesPage() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [driverReviews, setDriverReviews] = useState<DriverReviews | null>(null);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  const fetchAllRides = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/ride/all");

      if (!res.ok) throw new Error("Failed to fetch rides");

      const data = await res.json();
      const availableRides = (data.rides || []).filter(
        (ride: Ride) => ride.status === "SCHEDULED" && ride.seatsAvailable > 0
      );
      setRides(availableRides);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const searchRides = async () => {
    if (!origin || !destination) {
      alert("Please enter both origin and destination");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        source: origin,
        destination,
      }).toString();

      const res = await fetch(`http://localhost:5000/api/ride/search?${query}`);

      if (!res.ok) throw new Error("No rides found");

      const data = await res.json();
      const availableRides = (data.rides || []).filter(
        (ride: Ride) => ride.status === "SCHEDULED" && ride.seatsAvailable > 0
      );
      setRides(availableRides);
    } catch (err: any) {
      setError(err.message || "No rides found");
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const bookRide = async (rideId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first");
      router.push("/");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/booking/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rideId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      alert("✅ Ride booked successfully!");
      router.push("/bookings");
    } catch (err: any) {
      alert(err.message || "Failed to book ride");
    }
  };

  const viewDriverReviews = async (driverId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/booking/driver-reviews/${driverId}`);

      if (!res.ok) throw new Error("Failed to fetch reviews");

      const data = await res.json();
      setDriverReviews(data);
      setSelectedDriverId(driverId);
      setShowReviewsModal(true);
    } catch (err: any) {
      alert(err.message || "Failed to load reviews");
    }
  };

  useEffect(() => {
    fetchAllRides();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Find a Ride 🚗</h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              ← Back
            </button>
          </div>

          {/* Search Form */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="🔍 Origin (e.g., Mumbai)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="🎯 Destination (e.g., Pune)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={searchRides}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold"
                >
                  Search 🔍
                </button>
                <button
                  onClick={fetchAllRides}
                  className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition"
                  title="Show all rides"
                >
                  All
                </button>
              </div>
            </div>
          </div>

          {/* Loading & Error States */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching for rides...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">😕</p>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchAllRides}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                View All Rides
              </button>
            </div>
          )}

          {/* Rides List */}
          {!loading && !error && (
            <div className="space-y-4">
              {rides.length > 0 ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Found <strong>{rides.length}</strong> available ride{rides.length !== 1 ? "s" : ""}
                  </p>
                  {rides.map((ride) => (
                    <div
                      key={ride.id}
                      className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all bg-white"
                    >
                      {/* Route */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🚗</span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-600">
                              {ride.origin}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="text-lg font-bold text-blue-600">
                              {ride.destination}
                            </span>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          ₹{ride.price}
                        </span>
                      </div>

                      {/* Date & Seats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 mb-1">📅 Date & Time</p>
                          <p className="font-semibold">
                            {new Date(ride.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(ride.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 mb-1">💺 Seats Available</p>
                          <p className="text-3xl font-bold text-blue-600">
                            {ride.seatsAvailable}
                          </p>
                        </div>
                      </div>

                      {/* Driver Info */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-gray-800">
                            👤 Driver: {ride.driver.name}
                          </p>
                          <button
                            onClick={() => viewDriverReviews(ride.driver.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                          >
                            View Reviews ⭐
                          </button>
                        </div>
                        {ride.driver.phone && (
                          <p className="text-sm text-gray-600 mb-2">
                            📞 {ride.driver.phone}
                          </p>
                        )}
                        {ride.driver.vehicles.length > 0 && (
                          <div className="bg-white rounded-lg p-3 mt-2">
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              Vehicle:
                            </p>
                            <p className="text-sm text-gray-600">
                              🚙 {ride.driver.vehicles[0].make}{" "}
                              {ride.driver.vehicles[0].model} ({ride.driver.vehicles[0].year})
                            </p>
                            <p className="text-sm text-gray-600">
                              🎨 Color: {ride.driver.vehicles[0].color}
                            </p>
                            <p className="text-sm text-gray-600 font-mono">
                              🔢 {ride.driver.vehicles[0].licensePlate}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Book Button */}
                      <button
                        onClick={() => bookRide(ride.id)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition font-bold text-lg"
                      >
                        Book This Ride 🎫
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-6xl mb-4">🚗</p>
                  <p className="text-gray-600 text-lg mb-4">
                    No rides found. Try different locations or check back later!
                  </p>
                  <button
                    onClick={fetchAllRides}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    View All Available Rides
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Modal */}
      {showReviewsModal && driverReviews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Driver Reviews ⭐</h2>
              <button
                onClick={() => setShowReviewsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                  <p className="text-4xl font-bold text-yellow-600">
                    {driverReviews.averageRating}
                    <span className="text-2xl">⭐</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {driverReviews.totalReviews}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            {driverReviews.reviews.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">Rating Distribution</h3>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = driverReviews.reviews.filter((r) => r.rating === star).length;
                  const percentage =
                    driverReviews.totalReviews > 0
                      ? (count / driverReviews.totalReviews) * 100
                      : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 mb-2">
                      <span className="text-sm w-12">{star}⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-yellow-500 h-3 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm w-8 text-gray-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Recent Reviews</h3>
              {driverReviews.reviews.length > 0 ? (
                driverReviews.reviews.slice(0, 10).map((review, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-500">
                        {"⭐".repeat(review.rating)}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({review.rating}/5)
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 italic">"{review.comment}"</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">
                  No reviews yet for this driver
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}