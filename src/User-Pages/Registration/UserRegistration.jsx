import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationModal from "../../Components/Modals/NotificationModal";
import LoadingOverlay from "../../Components/Modals/LoadingOverlay";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";
import AddressAutocomplete from "../../Components/Hooks/AddressAutoComplete/AddressAutoComplete";

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const { apiClient } = useAuth();
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

    if (!acceptedTerms) {
      setError("You must agree to the Terms & Agreement before continuing.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setIsSendingOtp(true);
      setLoading(true);
      await apiClient.post("/users/otp/send-registration-otp", {
        email: formData.email,
        userName: `${formData.first_name} ${formData.last_name}`,
      });

      setShowOtpModal(true);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to send OTP";
      console.error("handleSubmit OTP error:", err);
      setNotification({
        isOpen: true,
        type: "error",
        message,
        redirectTo: "",
      });
    } finally {
      setIsSendingOtp(false);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      setLoading(true);

      await apiClient.post("/users/otp/verify-registration-otp", {
        email: formData.email,
        code: otp,
      });

      await apiClient.post("/users/register", {
        ...formData,
        role: "pet owner",
      });

      setShowOtpModal(false);
      setNotification({
        isOpen: true,
        type: "success",
        message: "Registration complete!",
        redirectTo: "/",
      });
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Invalid or expired OTP";
      console.error("handleVerifyOtp error:", err);
      setError(message);
    } finally {
      setIsVerifyingOtp(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 py-6 sm:py-8">
      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl bg-white shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10 mx-auto">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-3xl sm:text-4xl font-bold text-[#a16f4a] flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <span role="img" aria-label="paw" className="text-4xl sm:text-5xl">
              🐾
            </span>
            Pawfect Care
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Create your account to get started
          </p>
        </div>

        {/* Registration Form */}
        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          {/* First & Last Name - Stack on mobile, side-by-side on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-amber-900 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-amber-900 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition text-sm sm:text-base"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-amber-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition text-sm sm:text-base"
              required
            />
          </div>

          {/* Birthdate & Sex */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-amber-900 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition text-sm sm:text-base webkit-date-fix"
                required
              />
              {formData.age > 0 && (
                <p className="text-xs text-gray-500 mt-1.5">
                  Age: {formData.age} years
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-amber-900 mb-2">
                Sex
              </label>
              <div className="relative">
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-amber-200 rounded-xl bg-white appearance-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition cursor-pointer text-sm sm:text-base"
                  required
                >
                  <option value="">Select sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-amber-600 pointer-events-none text-xs sm:text-sm">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Salary & Address */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-amber-900 mb-2">
                Monthly Income
              </label>
              <div className="relative">
                <select
                  name="monthly_salary"
                  value={formData.monthly_salary}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-amber-200 rounded-xl bg-white appearance-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition cursor-pointer text-sm sm:text-base"
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
                <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-amber-600 pointer-events-none text-xs sm:text-sm">
                  ▼
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-amber-900 mb-2">
                Address
              </label>
              <AddressAutocomplete
                value={formData.address}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, address: val }))
                }
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-amber-900 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-amber-200 rounded-xl pr-10 sm:pr-12 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition text-sm sm:text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 sm:right-3 flex items-center text-amber-700 hover:text-amber-900 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-amber-900 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-amber-200 rounded-xl pr-10 sm:pr-12 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition text-sm sm:text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-2 sm:right-3 flex items-center text-amber-700 hover:text-amber-900 transition"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Terms & Agreement */}
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-center mt-2 gap-2 sm:gap-2">
            <div className="flex items-center gap-2">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 text-[#a16f4a] border-amber-300 rounded"
              />
              <label
                htmlFor="terms"
                className="text-xs sm:text-sm text-gray-700 text-center sm:text-left"
              >
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[#a16f4a] font-semibold underline"
                >
                  Terms & Agreement
                </button>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 rounded-xl bg-[#a16f4a] text-white font-semibold text-base sm:text-lg hover:bg-amber-900 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          {/* Login Link */}
          <p className="text-center text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-[#a16f4a] font-semibold hover:underline cursor-pointer"
            >
              Log in here
            </span>
          </p>
        </form>
      </div>

      {/* Modals remain the same */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        message={notification.message}
        redirectTo={notification.redirectTo}
      />

      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-amber-900 mb-2 text-center">
              Pawfect Care — Terms & Agreement
            </h2>

            <p className="text-center text-xs text-gray-500 mb-4">
              Last Updated: March 2025
            </p>

            <div className="space-y-4 text-sm text-gray-700 text-justify">
              {/* Intro */}
              <p>
                By creating an account or using the Pawfect Care: Web-Based Pet
                Adoption and Pet Care Management System, you agree to the
                following Terms and Privacy Guidelines. Please read them
                carefully.
              </p>

              {/* 2. Information We Collect */}
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  2. Information We Collect
                </h3>
                <p className="mb-1">
                  To provide these services, Pawfect Care may collect the
                  following information:
                </p>

                <p className="font-semibold mt-1">2.1 Personal Information</p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>Full Name</li>
                  <li>Email Address</li>
                  <li>Date of Birth</li>
                  <li>Gender</li>
                  <li>Address</li>
                  <li>Monthly Income</li>
                </ul>

                <p className="font-semibold mt-2">2.2 System Use Information</p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>Login details</li>
                  <li>Submitted adoption applications</li>
                  <li>Appointment schedules</li>
                </ul>

                <p className="font-semibold mt-2">2.3 Pet Information</p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>Pet details provided by the administrator</li>
                </ul>
              </div>

              {/* 3. How Your Information is Used */}
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  3. How Your Information is Used
                </h3>
                <p className="mb-1">
                  Your information will only be used for the following purposes:
                </p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>To process your adoption applications</li>
                  <li>To schedule consultations and vaccinations</li>
                  <li>To send notifications regarding your appointments</li>
                  <li>
                    To assist the administrator in managing and updating records
                  </li>
                  <li>
                    To generate daily system reports (without showing sensitive
                    information)
                  </li>
                </ul>
                <p className="mt-2">
                  Pawfect Care does not sell, trade, or share your information
                  with outside organizations.
                </p>
              </div>

              {/* 4. Data Protection & Security */}
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  4. Data Protection & Security
                </h3>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>
                    All stored information is kept confidential and protected
                    within the system.
                  </li>
                  <li>
                    Access to user data is limited to authorized administrators.
                  </li>
                  <li>
                    Pawfect Care applies security measures to prevent
                    unauthorized access or data misuse.
                  </li>
                </ul>
              </div>

              {/* 5. User Responsibilities */}
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  5. User Responsibilities
                </h3>
                <p className="mb-1">By using the system, you agree to:</p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>Provide accurate and truthful information</li>
                  <li>Keep your login details confidential</li>
                  <li>
                    Use the platform responsibly and only for its intended
                    purpose
                  </li>
                  <li>Update your information when necessary</li>
                </ul>
              </div>

              {/* 6. Your Rights */}
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  6. Your Rights
                </h3>
                <p className="mb-1">Users have the right to:</p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>Access and review their personal information</li>
                  <li>Request corrections to inaccurate details</li>
                  <li>Withdraw from the system at any time</li>
                </ul>
              </div>

              {/* 7. Consent */}
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  7. Consent
                </h3>
                <p className="mb-1">
                  By clicking “I Agree”, you acknowledge that:
                </p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>
                    You have read and understood the Terms and Privacy Agreement
                  </li>
                  <li>
                    You consent to the collection and use of your information as
                    described
                  </li>
                  <li>You agree to comply with the system’s policies</li>
                </ul>
              </div>

              {/* 8. Changes to the Terms */}
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  8. Changes to the Terms
                </h3>
                <p>
                  Pawfect Care may update these Terms and Privacy Agreement as
                  needed. Users will be notified when changes occur.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h2 className="text-lg sm:text-xl font-semibold text-amber-900 mb-2">
              Verify your email
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              We sent a 6-digit verification code to{" "}
              <span className="font-semibold">{formData.email}</span>. Enter it
              below to complete your registration.
            </p>

            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl text-center tracking-[0.5em] text-lg font-semibold mb-3"
              placeholder="••••••"
            />

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowOtpModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm"
                disabled={isVerifyingOtp}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                className="px-4 py-2 rounded-lg bg-[#a16f4a] text-white text-sm font-semibold hover:bg-amber-900 disabled:opacity-60"
              >
                {isVerifyingOtp ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}

      <LoadingOverlay loading={loading} />
    </div>
  );
}

export default UserRegistrationPage;
