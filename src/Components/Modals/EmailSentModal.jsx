import React from "react";
import { CheckCircle } from "lucide-react";

function EmailSentModal({ isOpen, onClose, message = "Processing..." }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose} // close when clicking outside
    >
      <div
        className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg animate-scaleUp"
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
      >
        <CheckCircle className="text-green-500 w-15 h-15 mb-4 animate-checkmark" />
        <p className="text-2xl font-semibold text-gray-800 mb-2">Email Sent!</p>
        <p className="text-gray-600 text-center">{message}</p>
      </div>
    </div>
  );
}

export default EmailSentModal;
