// src/utils/api.js
const API_BASE_URL = "http://localhost:8081";

export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // If token expired or missing → logout and redirect to login
    localStorage.removeItem("token");
    window.location.href = "/admin/login"; // Go back to login page
    throw new Error("Session expired. Please log in again.");
  }

  return res.json();
};
