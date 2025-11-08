import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { redirect, useNavigate } from "react-router-dom";
import { getApiBaseUrl } from "../../../../Backend/config/API_BASE_URL";
import NotificationModal from "../../Components/Modals/NotificationModal";
import LoadingOverlay from "../../Components/Modals/LoadingOverlay"; // <-- new import

function UserRegistrationPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    monthly_salary: "",
    birthdate: "",
    age: "",
    sex: "",
    address: "",
    password: "",
    confirmPassword: "",
    role: "pet owner",
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "",
    message: "",
    redirectTo: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "birthdate") {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      setFormData((prev) => ({ ...prev, birthdate: value, age }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "pet owner",
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Registration failed");

      setNotification({
        isOpen: true,
        type: "success",
        message: "Registration Complete!",
        redirectTo: "/user/login",
      });
    } catch (err) {
      setNotification({
        isOpen: true,
        type: "error",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 py-8">
      <div className="relative z-10 w-full max-w-2xl bg-white shadow-2xl rounded-3xl p-8 md:p-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-[#a16f4a] flex items-center justify-center gap-3 mb-2">
            <span role="img" aria-label="paw" className="text-5xl">
              🐾
            </span>
            Pawfect Care
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Create your account to get started
          </p>
        </div>

        {/* Registration Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* First & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              required
            />
          </div>

          {/* Birthdate & Sex */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                required
              />
              {formData.age > 0 && (
                <p className="text-xs text-gray-500 mt-1.5">
                  Age: {formData.age} years
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Sex
              </label>
              <div className="relative">
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-white appearance-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition cursor-pointer"
                  required
                >
                  <option value="">Select sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-600 pointer-events-none">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Salary & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Monthly Income
              </label>
              <div className="relative">
                <select
                  name="monthly_salary"
                  value={formData.monthly_salary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-white appearance-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select income range
                  </option>
                  <option value="Below₱5,000">₱0 - ₱5,000</option>
                  <option value="₱5,000-₱10,000">₱5,000 - ₱10,000</option>
                  <option value="₱10,001-₱20,000">₱10,001 - ₱20,000</option>
                  <option value="₱20,001-₱40,000">₱20,001 - ₱40,000</option>
                  <option value="₱40,001-₱60,000">₱40,001 - ₱60,000</option>
                  <option value="Above₱60,000">Above ₱60,000</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-600 pointer-events-none">
                  ▼
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl pr-12 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-amber-700 hover:text-amber-900 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl pr-12 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-amber-700 hover:text-amber-900 transition"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#a16f4a] text-white font-semibold text-lg hover:bg-amber-900 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/user/login")}
              className="text-[#a16f4a] font-semibold hover:underline cursor-pointer"
            >
              Log in here
            </span>
          </p>
        </form>
      </div>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        message={notification.message}
        redirectTo={notification.redirectTo}
      />

      <LoadingOverlay loading={loading} />
    </div>
  );
}
export default UserRegistrationPage;
