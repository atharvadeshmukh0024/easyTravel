"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isDriver, setIsDriver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions.");
      return;
    }

    setLoading(true);
    try {
      const body = { name, email, password, phone, isDriver };
      await apiRequest("/auth/register", "POST", body);

      // Show success message
      alert("✅ Registration successful! Please log in.");
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 p-12 items-center justify-center relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-white max-w-lg">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
            <span className="text-5xl">🚗</span>
          </div>
          
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Join the Movement
          </h2>
          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            Become part of our growing community of travelers and drivers. 
            Share rides, save money, and make your commute more enjoyable.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">10K+</div>
              <div className="text-green-100 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">50K+</div>
              <div className="text-green-100 text-sm">Rides Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">4.8⭐</div>
              <div className="text-green-100 text-sm">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
              <span className="text-3xl">🚗</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">Start your journey with easyTravel</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">👤</span>
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">📧</span>
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">📞</span>
                </div>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔒</span>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 6 characters
              </p>
            </div>

            {/* Driver Checkbox */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border-2 border-transparent hover:border-green-200 transition-all duration-200">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDriver}
                  onChange={(e) => setIsDriver(e.target.checked)}
                  className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                />
                <div className="ml-3">
                  <span className="font-medium text-gray-900 flex items-center">
                    Register as a Driver 🚗
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Offer rides and earn money by sharing your commute with others
                  </p>
                </div>
              </label>
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="#" className="text-green-600 hover:text-green-700 font-medium hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-green-600 hover:text-green-700 font-medium hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          {/* Social Signup Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Facebook</span>
            </button>
          </div>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/"
              className="font-semibold text-green-600 hover:text-green-700 hover:underline"
            >
              Sign in instead
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}