import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import NotificationModal from "../../Components/Modals/NotificationModal";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

function AdoptionForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pet_id } = location.state || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [petInfo, setPetInfo] = useState(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "",
    message: "",
    redirectTo: "",
  });
  const [formData, setFormData] = useState({
    purpose: "",
  });
  const { apiClient, token } = useAuth();

  // Scroll to top on mount/route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // Page loading with minimum delay for smooth UX
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500); // 500ms minimum - feels premium without being slow

    return () => clearTimeout(loadTimer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  console.log(pet_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setNotification({
        isOpen: true,
        type: "error",
        message: "You need to sign in to adopt a pet!",
        redirectTo: "/",
      });
      return;
    }

    if (!pet_id) {
      setNotification({
        isOpen: true,
        type: "error",
        message: "Missing pet information. Please go back and select a pet.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post("/process/adoption", {
        pet_id,
        purpose_of_adoption: formData.purpose,
      });

      navigate("/user/adoption", {
        state: { showAdoptionConfirmation: true },
      });
    } catch (error) {
      console.error("Error submitting adoption request:", error);

      // ---- handle 403 UNDERAGE from backend ----
      if (error.response && error.response.status === 403) {
        setNotification({
          isOpen: true,
          type: "error",
          message:
            error.response.data?.message ||
            "You must be at least 18 years old to submit an adoption request.",
          redirectTo: "/user/adoption", // or maybe "/user/profile" if you want
        });
      } else {
        setNotification({
          isOpen: true,
          type: "error",
          message:
            "Failed to submit adoption request. Please try again or contact support.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loader until page is ready
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-[#7c5e3b] to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Loader2 className="w-16 h-16 text-white animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              Preparing Adoption Form
            </h2>
            <p className="text-gray-600">
              Getting everything ready for your new companion...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-6">
              <div className="bg-gradient-to-r from-[#7c5e3b] to-amber-500 h-2 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#7c5e3b] mb-4">
            Pet Adoption Application
          </h1>
          <div className="w-24 h-1 bg-[#7c5e3b] mx-auto rounded-full mb-4"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take the first step towards giving a loving home to your new
            companion
          </p>
        </div>

        {/* Pet Info Card */}
        {petInfo && (
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={petInfo.imageUrl || "/default-pet.png"}
                  alt={petInfo.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {petInfo.name}
                </h3>
                <p className="text-xl text-gray-600 mb-4">{petInfo.breed}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {petInfo.gender}
                  </span>
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {petInfo.size}
                  </span>
                  <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {petInfo.color}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Purpose Section */}
            <div>
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-[#7c5e3b] rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <label className="block text-2xl font-bold text-gray-900 mb-2">
                    Purpose of Adoption
                  </label>
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
                    <p className="text-amber-800 leading-relaxed">
                      <span className="font-semibold">📝 Important:</span>{" "}
                      Please explain why you want to adopt this pet. This helps
                      us ensure that you're ready to provide a safe, loving, and
                      permanent home. Consider including your experience with
                      pets, living situation, and commitment to pet care.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  rows={12}
                  className="w-full border-2 border-gray-200 rounded-2xl p-6 text-lg leading-relaxed focus:border-[#7c5e3b] focus:outline-none transition-colors duration-300 resize-none"
                  placeholder="Please share your reasons for wanting to adopt this pet. Tell us about your experience with pets, your living situation, and how you plan to care for your new companion..."
                />
                <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                  {formData.purpose.length} characters
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Adoption Guidelines
              </h4>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  Provide a safe and loving environment for the pet
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  Ensure regular veterinary care and vaccinations
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  Commit to the pet for its entire lifetime
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  Provide adequate food, water, shelter, and exercise
                </li>
              </ul>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-300 text-lg"
              >
                ← Back to Pet Details
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-[#7c5e3b] to-[#8b6f47] text-white font-bold rounded-2xl hover:from-[#6b4f32] hover:to-[#7a5f3e] transform hover:scale-105 transition-all duration-300 shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Application...
                  </span>
                ) : (
                  "Submit Adoption Application"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        message={notification.message}
        redirectTo={notification.redirectTo}
      />
    </div>
  );
}

export default AdoptionForm;
