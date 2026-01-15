import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PawfectCareLogo from "../../assets/User-Page-Image/PawfectCareLogo.svg";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  // FIXED: Single step with clear flow
  const [formData, setFormData] = useState({
    email: email || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false); // Track OTP step

  const { apiClient } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (message) setMessage(""); // Clear error on input
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) return setMessage("Email required");

    setLoading(true);
    try {
      console.log("Sending OTP to:", formData.email);
      await apiClient.post("/users/forgot-password", { email: formData.email });
      setMessage("OTP sent! Check your email (120s validity)");
      setOtpSent(true);
    } catch (err) {
      console.error("OTP request failed:", err.response?.data);
      setMessage(err.response?.data?.message || "Failed to send OTP");
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
    try {
      const response = await apiClient.post("/users/verify-forgot-otp-reset", {
        email: formData.email,
        code: formData.otp, // ✅ Backend expects 'code'
        newPassword: formData.newPassword,
      });
      console.log("Reset success:", response.data);
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Reset failed:", err.response?.data);
      setMessage(err.response?.data?.message || "OTP invalid/expired");
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
            {otpSent ? "Enter OTP to reset password" : "Reset your password"}
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.includes("✅") || message.includes("🎉")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* FORM - Single flow with conditional fields */}
        <form
          onSubmit={otpSent ? verifyOtpAndReset : requestOtp}
          className="space-y-4"
        >
          {/* Email - Always shown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-2 rounded-full border border-[#a16f4a] focus:ring-2 focus:ring-amber-400 focus:outline-none text-sm"
              disabled={otpSent}
            />
          </div>

          {/* OTP - Show after email sent */}
          {otpSent && (
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
                className="w-full px-4 py-2 rounded-full border border-[#a16f4a] focus:ring-2 focus:ring-amber-400 focus:outline-none text-center text-lg tracking-widest font-mono bg-gray-50"
              />
            </div>
          )}

          {/* Passwords - Show after OTP step */}
          {otpSent && (
            <>
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
                  placeholder="New password (6+ chars)"
                  className="w-full px-4 py-2 rounded-full border border-[#a16f4a] focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
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
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 rounded-full border border-[#a16f4a] focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#a16f4a] text-white rounded-full shadow-lg hover:bg-[#8b5e3e] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm uppercase tracking-wide"
          >
            {loading
              ? "Processing..."
              : otpSent
              ? "Reset Password"
              : "Send OTP"}
          </button>
        </form>

        {/* Back to Login */}
        {!otpSent && (
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Back to{" "}
              <button
                onClick={() => navigate("/")}
                className="text-[#a16f4a] font-medium hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
