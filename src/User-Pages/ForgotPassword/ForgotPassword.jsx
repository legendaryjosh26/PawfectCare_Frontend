import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PawfectCareLogo from "../../assets/User-Page-Image/PawfectCareLogo.svg";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    alert("Your password has been reset successfully!");
    navigate("/user/login");
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
            Set a new password for your account
          </p>
        </div>

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Enter new password"
              className="w-full px-4 py-2 rounded-full border border-[#a16f4a] focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
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

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#a16f4a] text-white rounded-full shadow-md hover:bg-[#8b5e3e] transition"
          >
            Reset Password
          </button>
        </form>

        {/* Back to login */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remembered it?{" "}
            <button
              onClick={() => navigate("/user/login")}
              className="text-[#a16f4a] font-medium hover:underline"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
