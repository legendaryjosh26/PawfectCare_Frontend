import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PawfectCareLogo from "../../assets/User-Page-Image/PawfectCareLogo.svg";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [step, setStep] = useState(email ? "otp" : "request");
  const [otpModal, setOtpModal] = useState(false);
  const [formData, setFormData] = useState({
    email: email || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { apiClient, token } = useAuth();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) return setMessage("Email required");

    setLoading(true);
    try {
      await apiClient.post("/users/forgot-password", { email: formData.email });
      setMessage("OTP sent! Check your email (120s validity).");
      setOtpModal(true); // Show OTP modal
    } catch (err) {
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
      await apiClient.post("/users/verify-forgot-otp-reset", {
        email: formData.email,
        code: formData.otp,
        newPassword: formData.newPassword,
      });
      setMessage("Password reset successful!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
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
            {step === "otp"
              ? "Enter OTP to reset password"
              : "Reset your password"}
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.includes("success")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Step 1: Request OTP */}
        {step === "request" && (
          <form onSubmit={requestOtp} className="space-y-4">
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
                className="w-full px-4 py-2 rounded-full border border-[#a16f4a] focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-[#a16f4a] text-white rounded-full shadow-md hover:bg-[#8b5e3e] transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* OTP + Reset Modal */}
        {otpModal && (
          <div className="space-y-4">
            <form onSubmit={verifyOtpAndReset} className="space-y-4">
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
                  className="w-full px-4 py-2 rounded-full border border-[#a16f4a] focus:ring-2 focus:ring-amber-400 focus:outline-none text-center text-lg tracking-widest font-mono"
                />
              </div>
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
                  placeholder="New password"
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
                  placeholder="Confirm password"
                  className="w-full px-4 py-2 rounded-full border border-[#a16f4a] focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-[#a16f4a] text-white rounded-full shadow-md hover:bg-[#8b5e3e] transition disabled:opacity-50"
              >
                {loading ? "Reset..." : "Reset Password"}
              </button>
            </form>
            <button
              onClick={() => setOtpModal(false)}
              className="w-full py-2 px-4 text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition"
            >
              Back to Request OTP
            </button>
          </div>
        )}

        {/* Back to login */}
        <div className="text-center">
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
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
