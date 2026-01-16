import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { AuthProvider } from "../src/Components/ServiceLayer/Context/authContext.jsx";
import App from "./App.jsx";
import "./index.css";

// disable browser scroll restoration
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
