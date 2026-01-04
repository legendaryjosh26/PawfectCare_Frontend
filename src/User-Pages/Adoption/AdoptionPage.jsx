import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PawfectCareLogo from "../../assets/User-Page-Image/PawfectCareLogo.svg";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const { apiClient } = useAuth(); // Only use apiClient, no token needed for forgot password

  const [otpModal, setOtpModal] = useState(false);
  const [formData, setFormData] = useState({
    email: email || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) return setMessage("Email required");

    setLoading(true);
    setMessage("");
    try {
      const response = await apiClient.post("/users/forgot-password", {
        email: formData.email,
      });
      setMessage("OTP sent! Check your email (120s validity).");
      setOtpModal(true);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to send OTP. Try again."
      );
    }
    setLoading(false);
  };

  const verifyOtpAndReset = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return setMessage("Passwords don't match!");
    }
    if (formData.newPassword.length < 6) {
      return setMessage("Password must be 6+ characters");
    }

    setLoading(true);
    setMessage("");
    try {
      await apiClient.post("/users/verify-forgot-otp-reset", {
        email: formData.email,
        code: formData.otp,
        newPassword: formData.newPassword,
      });
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "OTP invalid/expired. Request new code."
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#fdfaf6]">
      <div className="relative z-10 w-full max-w-sm space-y-6 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8">
        {/* Logo + Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-3xl font-semibold text-[#a16f4a]">
            <img
              src={PawfectCareLogo}
              alt="Pawfect Care Logo"
              className="w-10 h-10"
            />
            Pawfect Care
          </div>
          <p className="text-gray-600 mt-2 text-sm">
            {otpModal ? "Enter OTP to reset password" : "Reset your password"}
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.startsWith("")
                ? "bg-green-100 border border-green-300 text-green-800"
                : "bg-red-100 border border-red-300 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Request OTP Form */}
        {!otpModal && (
          <form onSubmit={requestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-full border-2 border-[#a16f4a]/30 focus:border-[#a16f4a] focus:ring-2 focus:ring-amber-200/50 focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#a16f4a] text-white rounded-full shadow-lg hover:bg-[#8b5e3e] hover:shadow-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {/* OTP + Password Reset */}
        {otpModal && (
          <div className="space-y-4">
            <form onSubmit={verifyOtpAndReset} className="space-y-4">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code (from email)
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  required
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-full border-2 border-[#a16f4a]/30 focus:border-[#a16f4a] focus:ring-2 focus:ring-amber-200/50 focus:outline-none text-center text-xl tracking-widest font-mono font-bold bg-gradient-to-r from-amber-50 to-orange-50"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Valid for 120 seconds
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-full border-2 border-[#a16f4a]/30 focus:border-[#a16f4a] focus:ring-2 focus:ring-amber-200/50 focus:outline-none transition-all"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3 rounded-full border-2 border-[#a16f4a]/30 focus:border-[#a16f4a] focus:ring-2 focus:ring-amber-200/50 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#a16f4a] to-[#8b5e3e] text-white rounded-full shadow-lg hover:shadow-xl hover:from-[#8b5e3e] hover:to-[#7c5e3b] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset My Password"}
              </button>
            </form>

            {/* Back button */}
            <button
              type="button"
              onClick={() => {
                setOtpModal(false);
                setMessage("");
              }}
              className="w-full py-2 px-4 text-gray-600 border-2 border-gray-200 rounded-full hover:bg-gray-50 hover:border-[#a16f4a]/50 transition-all font-medium"
            >
              ← Request New Code
            </button>
          </div>
        )}

        {/* Back to Login */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-[#a16f4a] font-semibold hover:underline transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
