import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function BookingConfirmationModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose(); // ✅ Close the modal automatically
        navigate("/user/booking"); // ✅ Redirect automatically
      }, 2000); // 2 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [isOpen, onClose, navigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <CheckCircle className="text-green-500 w-20 h-20 mb-4 animate-checkmark" />
        <p className="text-2xl font-semibold text-gray-800">
          Booking Confirmed!
        </p>
        <p className="text-gray-600 mt-2 text-sm">Redirecting...</p>
      </div>
    </div>
  );
}

export default BookingConfirmationModal;
