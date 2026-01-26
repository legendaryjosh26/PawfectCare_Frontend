import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://backend-5lqs.onrender.com", // or your API base
  withCredentials: true, // crucial for cookie-based auth!
});

export default apiClient;
export const REFRESH_TOKEN_URL = "/users/refresh-token"; // or whatever your refresh endpoint is
