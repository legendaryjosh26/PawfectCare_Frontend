import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function NotificationModal({
  isOpen,
  onClose,
  type = "success",
  message = "",
  redirectTo = "", // optional redirect route
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isError = type === "error";
  const Icon = isError ? AlertCircle : CheckCircle;
  const colorClass = isError
    ? "text-red-600 bg-red-50 border-red-300"
    : "text-green-600 bg-green-50 border-green-300";

  const handleOk = () => {
    if (redirectTo) {
      navigate(redirectTo); // navigate if route provided
    } else {
      onClose(); // otherwise just close
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className={`flex flex-col items-center text-center border rounded-2xl shadow-lg p-6 w-80 ${colorClass}`}
      >
        <Icon className="w-10 h-10 mb-3" />
        <p className="text-base font-medium mb-4">{message}</p>
        <button
          onClick={handleOk}
          className={`px-4 py-2 rounded font-semibold ${
            isError
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default NotificationModal;
