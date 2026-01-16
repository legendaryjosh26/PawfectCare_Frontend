import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { AuthProvider } from "../src/Components/ServiceLayer/Context/authContext.jsx";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
