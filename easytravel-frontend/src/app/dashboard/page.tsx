"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  isDriver?: boolean;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Status ${res.status}`);
        }

        const data = await res.json();
        const maybeUser = data.user ?? data.data ?? data;
        setUser(maybeUser);
      } catch (error: any) {
        console.error("Failed to load profile:", error);
        setErr(error?.message || "Failed to fetch profile");
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        setTimeout(() => router.push("/"), 1200);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const logout = () => {
    if (typeof window !== "undefined") localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Authentication Error</h2>
          <p className="text-sm text-red-600 mb-6">{err}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const displayName = user?.name ?? "Guest User";
  const displayEmail = user?.email ?? "unknown";
  const displayPhone = user?.phone ?? "Not provided";
  const role = user?.isDriver ? "Driver" : "Passenger";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🚗</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">easyTravel</h1>
                <p className="text-xs text-gray-500">Your ride, your way</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{role}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {initials}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              Welcome back, {displayName.split(" ")[0]}! 👋
            </h2>
            <p className="text-blue-100 text-lg">
              {user?.isDriver 
                ? "Ready to offer rides and earn money today?"
                : "Where would you like to go today?"
              }
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎫</span>
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                Active
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Rides</h3>
            <p className="text-3xl font-bold text-gray-900">24</p>
            <p className="text-sm text-gray-500 mt-2">+3 this week</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                Saved
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Money Saved</h3>
            <p className="text-3xl font-bold text-gray-900">₹2,450</p>
            <p className="text-sm text-gray-500 mt-2">vs solo driving</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                Excellent
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Your Rating</h3>
            <p className="text-3xl font-bold text-gray-900">4.8</p>
            <p className="text-sm text-gray-500 mt-2">Based on 18 reviews</p>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👤</span>
            Profile Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-semibold text-gray-900">{displayEmail}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="font-semibold text-gray-900">{displayPhone}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Account Type</p>
              <p className="font-semibold text-gray-900 flex items-center">
                {role}
                {user?.isDriver && <span className="ml-2 text-lg">🚗</span>}
                {!user?.isDriver && <span className="ml-2 text-lg">👤</span>}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Member Since</p>
              <p className="font-semibold text-gray-900">Nov 2024</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Find Rides */}
            <button
              onClick={() => router.push("/rides")}
              className="group bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">🔍</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h4 className="font-bold text-lg mb-1">Find Rides</h4>
              <p className="text-sm text-green-100">Search available rides</p>
            </button>

            {/* My Bookings */}
            <button
              onClick={() => router.push("/bookings")}
              className="group bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">🎫</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h4 className="font-bold text-lg mb-1">My Bookings</h4>
              <p className="text-sm text-blue-100">View your rides</p>
            </button>

            {/* Driver Dashboard - Conditional */}
            {user?.isDriver && (
              <button
                onClick={() => router.push("/driver")}
                className="group bg-gradient-to-br from-orange-500 to-amber-600 text-white p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">🚗</span>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="font-bold text-lg mb-1">Driver Dashboard</h4>
                <p className="text-sm text-orange-100">Manage your rides</p>
              </button>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center">
          <button
            onClick={logout}
            className="inline-flex items-center px-8 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all shadow-lg border-2 border-red-200 hover:border-red-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-gray-500">© 2024 easyTravel. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}