import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingConfirmationModal from "../../Components/Modals/BookingConfirmationModal";
import { getApiBaseUrl } from "../../../../Backend/config/API_BASE_URL";
import NotificationModal from "../../Components/Modals/NotificationModal";

function BookingForm() {
  const [formData, setFormData] = useState({
    service: "",
    date: "",
    time: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "",
    message: "",
    redirectTo: "",
  });
  const navigate = useNavigate();

  // Get today's date for minimum date validation
  const today = new Date().toISOString().split("T")[0];

  // Available time slots
  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];

  const services = [
    {
      value: "Consultation",
      label: "Consultation",
      description: "Expert veterinary advice and health check-up",
      icon: "🩺",
      duration: "30-45 minutes",
    },
    {
      value: "Vaccination",
      label: "Vaccination",
      description: "Immunization and deworming treatments",
      icon: "💉",
      duration: "15-30 minutes",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.service) newErrors.service = "Please select a service";
    if (!formData.date) newErrors.date = "Please select a date";
    if (!formData.time) newErrors.time = "Please select a time";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setNotification({
          isOpen: true,
          type: "error",
          message: "You must be logged in to book an appointment.",
          redirectTo: "/user/login",
        });
        return;
      }

      const response = await fetch(`${getApiBaseUrl()}/users/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointment_type: formData.service,
          appointment_date: formData.date,
          timeschedule: formData.time,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          navigate("/user/booking");
        }, 3000);
      } else {
        setNotification({
          isOpen: true,
          type: "error",
          message: "Failed to create booking. Please sign in and try again.",
          redirectTo: "/user/login",
        });
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setNotification({
        isOpen: true,
        type: "error",
        message: "Server error. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-4">
            Book Your Appointment
          </h1>
          <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full mb-4"></div>
          <p className="text-xl text-gray-600 max-w-lg mx-auto">
            Schedule professional veterinary care for your beloved pet
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Service Selection */}
            <div>
              <label className="block text-xl font-bold text-gray-900 mb-4">
                Select Service
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.value}
                    className={`relative cursor-pointer border-2 rounded-2xl p-6 transition-all duration-300 ${
                      formData.service === service.value
                        ? "border-indigo-500 bg-indigo-50 shadow-lg"
                        : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
                    }`}
                    onClick={() =>
                      handleChange({
                        target: { name: "service", value: service.value },
                      })
                    }
                  >
                    <input
                      type="radio"
                      name="service"
                      value={service.value}
                      checked={formData.service === service.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-start space-x-3">
                      <div className="text-3xl">{service.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {service.label}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {service.description}
                        </p>
                        <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          Duration: {service.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.service && (
                <p className="text-red-500 text-sm mt-2">{errors.service}</p>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xl font-bold text-gray-900 mb-4">
                Select Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={today}
                  className={`w-full px-4 py-4 text-lg border-2 rounded-2xl focus:outline-none transition-colors duration-300 ${
                    errors.date
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-indigo-500"
                  }`}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  📅
                </div>
              </div>
              {errors.date && (
                <p className="text-red-500 text-sm mt-2">{errors.date}</p>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-xl font-bold text-gray-900 mb-4">
                Select Time
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() =>
                      handleChange({ target: { name: "time", value: time } })
                    }
                    className={`py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      formData.time === time
                        ? "bg-indigo-600 text-white shadow-lg transform scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              {errors.time && (
                <p className="text-red-500 text-sm mt-2">{errors.time}</p>
              )}
            </div>

            {/* Appointment Summary */}
            {formData.service && formData.date && formData.time && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Appointment Summary
                </h4>
                <div className="space-y-2 text-green-800">
                  <p>
                    <span className="font-semibold">Service:</span>{" "}
                    {formData.service}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(formData.date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Time:</span> {formData.time}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Booking Appointment...
                </span>
              ) : (
                "Confirm Appointment"
              )}
            </button>
          </form>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6 text-gray-600">
          <p>
            Need help? Contact us at{" "}
            <span className="font-semibold">ovstacurong@gmail.com</span>
          </p>
        </div>
      </div>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        message={notification.message}
        redirectTo={notification.redirectTo}
      />
      <BookingConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

export default BookingForm;
