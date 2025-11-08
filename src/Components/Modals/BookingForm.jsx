import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingConfirmationModal from "./BookingConfirmationModal";

function BookingForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    date: "",
    time: "",
  });
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const DEV_MODE = true; // ✅ set to false in production

  useEffect(() => {
    if (DEV_MODE) {
      // Dummy user for testing
      setFormData((prev) => ({
        ...prev,
        name: "Test User",
        email: "testuser@example.com",
      }));
      return;
    }

    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user) {
          navigate("/user/login"); // redirect if not logged in
        } else {
          setFormData((prev) => ({
            ...prev,
            name: data.user.fullName,
            email: data.user.email,
          }));
        }
      })
      .catch(() => navigate("/user/login"));
  }, [navigate]);

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Booking Submitted:", formData);

    // In real app, send booking request to backend here
    setShowModal(true);
  };

  // 🔹 Handle modal confirmation
  const handleConfirm = () => {
    setShowModal(false);
    navigate("/booking"); // redirect to booking list
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Appointment Booking
        </h2>

        {/* Service Type */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Service Type
        </label>
        <div className="relative mb-4">
          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-lg appearance-none pr-10 ${
              formData.service === "" ? "text-gray-400" : "text-gray-900"
            }`}
          >
            <option value="">Select a service</option>
            <option value="Pet Consultation">Pet Consultation</option>
            <option value="Vaccination">Vaccination</option>
          </select>
          {/* Custom dropdown arrow */}
          <span className="absolute right-3 top-3 pointer-events-none text-gray-500">
            ▼
          </span>
        </div>

        {/* Date */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 mb-4 border rounded-lg"
        />

        {/* Time */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Time
        </label>
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 mb-6 border rounded-lg"
        />

        <button
          type="submit"
          className="w-full py-2 bg-[#a16f4a] text-white font-semibold rounded-lg hover:bg-[#8b5e3e] transition duration-300"
        >
          Confirm Booking
        </button>
      </form>

      {/* Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export default BookingForm;
