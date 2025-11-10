"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Vehicle = {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
};

type Ride = {
  id: number;
  origin: string;
  destination: string;
  date: string;
  price: number;
  seatsAvailable: number;
  status: string;
  bookings?: {
    id: number;
    status: string;
    passenger: { name: string; phone: string | null };
  }[];
};

export default function DriverDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"rides" | "vehicles">("rides");
  
  // Ride state
  const [rides, setRides] = useState<Ride[]>([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState("");
  
  // Vehicle state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchMyRides = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5000/api/ride/myrides", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch rides");
      const data = await res.json();
      setRides(data.rides || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5000/api/vehicle/my-vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const data = await res.json();
      setVehicles(data.vehicles || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRides();
    fetchMyVehicles();
  }, []);

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      alert("Please select both date and time");
      return;
    }

    if (vehicles.length === 0) {
      alert("Please add a vehicle first!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/ride/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          origin,
          destination,
          date,
          time,
          price: Number(price),
          seatsAvailable: Number(seatsAvailable),
        }),
      });

      if (!res.ok) throw new Error("Failed to create ride");

      alert("✅ Ride created successfully!");
      setOrigin("");
      setDestination("");
      setDate("");
      setTime("");
      setPrice("");
      setSeatsAvailable("");
      fetchMyRides();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/vehicle/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          make,
          model,
          year: Number(year),
          color,
          licensePlate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add vehicle");
      }

      alert("✅ Vehicle added successfully!");
      setMake("");
      setModel("");
      setYear("");
      setColor("");
      setLicensePlate("");
      fetchMyVehicles();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRideStatus = async (rideId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/ride/status/${rideId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      alert(`✅ Ride status updated to ${newStatus}`);
      fetchMyRides();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/booking/status/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update booking status");

      alert(`✅ Booking updated to ${newStatus}`);
      fetchMyRides();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteVehicle = async (vehicleId: number) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/vehicle/delete/${vehicleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete vehicle");

      alert("✅ Vehicle deleted successfully");
      fetchMyVehicles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      case "PENDING": return "bg-gray-100 text-gray-800";
      case "CONFIRMED": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Driver Dashboard 🚗</h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              ← Back
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab("rides")}
              className={`pb-3 px-4 font-semibold transition ${
                activeTab === "rides"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              🛣️ My Rides
            </button>
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`pb-3 px-4 font-semibold transition ${
                activeTab === "vehicles"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              🚙 My Vehicles
            </button>
          </div>

          {/* Rides Tab */}
          {activeTab === "rides" && (
            <div>
              {/* Create Ride Form */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Create New Ride ➕</h2>
                <form onSubmit={handleCreateRide} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Origin (e.g., Mumbai)"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                  />
                  <input
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Destination (e.g., Pune)"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                  <input
                    type="date"
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                  <input
                    type="time"
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Price (₹)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Seats Available"
                    value={seatsAvailable}
                    onChange={(e) => setSeatsAvailable(e.target.value)}
                    required
                    min="1"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition font-semibold disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Ride"}
                  </button>
                </form>
              </div>

              {/* Rides List */}
              <h2 className="text-xl font-bold mb-4">My Rides ({rides.length})</h2>
              {loading && <p className="text-center text-gray-600">Loading rides...</p>}
              {error && <p className="text-center text-red-600">{error}</p>}

              <div className="space-y-4">
                {rides.length > 0 ? (
                  rides.map((ride) => (
                    <div key={ride.id} className="border-2 rounded-xl p-5 hover:shadow-lg transition">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ride.status)}`}>
                          {ride.status}
                        </span>
                        <p className="text-sm text-gray-600">
                          {new Date(ride.date).toLocaleDateString()} at{" "}
                          {new Date(ride.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-lg font-semibold mb-3">
                        <span className="text-green-600">{ride.origin}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-blue-600">{ride.destination}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <p>💺 Seats: {ride.seatsAvailable}</p>
                        <p>💰 Price: ₹{ride.price}</p>
                      </div>

                      {/* Ride Status Update */}
                      {ride.status === "SCHEDULED" && (
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={() => updateRideStatus(ride.id, "IN_PROGRESS")}
                            className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition text-sm font-semibold"
                          >
                            Start Ride
                          </button>
                          <button
                            onClick={() => updateRideStatus(ride.id, "CANCELLED")}
                            className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition text-sm font-semibold"
                          >
                            Cancel Ride
                          </button>
                        </div>
                      )}

                      {ride.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => updateRideStatus(ride.id, "COMPLETED")}
                          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold mb-3"
                        >
                          Complete Ride
                        </button>
                      )}

                      {/* Bookings */}
                      {ride.bookings && ride.bookings.length > 0 && (
                        <div className="mt-3 border-t pt-3">
                          <p className="font-semibold mb-2">
                            Passengers ({ride.bookings.length}):
                          </p>
                          {ride.bookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="bg-gray-50 rounded-lg p-3 mb-2 flex items-center justify-between"
                            >
                              <div>
                                <p className="font-semibold">{booking.passenger.name}</p>
                                <p className="text-sm text-gray-600">
                                  📞 {booking.passenger.phone || "No phone"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                                {booking.status === "PENDING" && (
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                                  >
                                    Confirm
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-4">🚗</p>
                    <p className="text-gray-600">No rides yet. Create your first ride!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === "vehicles" && (
            <div>
              {/* Add Vehicle Form */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Add New Vehicle ➕</h2>
                <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Make (e.g., Toyota)"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    required
                  />
                  <input
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Model (e.g., Camry)"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Year (e.g., 2020)"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    min="1900"
                    max="2030"
                  />
                  <input
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Color (e.g., Blue)"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    required
                  />
                  <input
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="License Plate (e.g., ABC123)"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition font-semibold disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Vehicle"}
                  </button>
                </form>
              </div>

              {/* Vehicles List */}
              <h2 className="text-xl font-bold mb-4">My Vehicles ({vehicles.length})</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="border-2 rounded-xl p-5 hover:shadow-lg transition bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">🚗</span>
                        <button
                          onClick={() => deleteVehicle(vehicle.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📅 Year: {vehicle.year}</p>
                        <p>🎨 Color: {vehicle.color}</p>
                        <p className="font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                          🔢 {vehicle.licensePlate}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-4xl mb-4">🚙</p>
                    <p className="text-gray-600">No vehicles yet. Add your first vehicle!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}