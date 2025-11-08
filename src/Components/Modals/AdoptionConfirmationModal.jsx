import React from "react";
import { CheckCircle } from "lucide-react";

function AdoptionConfirmationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose} // closes when clicking background
    >
      <div
        className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg animate-scaleUp"
        onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside modal
      >
        <CheckCircle className="text-green-500 w-20 h-20 mb-4 animate-checkmark" />
        <p className="text-2xl font-semibold text-gray-800 mb-2">
          Submitted!
        </p>
        <p className="text-gray-600 text-center">
          Thank you for applying. We will review your application shortly.
        </p>
      </div>
    </div>
  );
}

export default AdoptionConfirmationModal;
