import React from "react";

function LoadingOverlay({ loading }) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center transition-opacity">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-lg font-medium">Please wait...</p>
      </div>
    </div>
  );
}

export default LoadingOverlay;
