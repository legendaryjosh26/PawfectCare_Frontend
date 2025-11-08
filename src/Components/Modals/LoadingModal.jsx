import React from "react";

function LoadingModal({ isOpen, message = "Processing..." }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-lg">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-semibold text-gray-800">{message}</p>
      </div>
    </div>
  );
}

export default LoadingModal;
