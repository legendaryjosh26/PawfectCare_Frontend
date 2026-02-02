// App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AnimatePresence } from "framer-motion";
import {
  DashboardRoute,
  AdoptionRequestRoute,
  AppointmentPageRoute,
  MessagesPageRoute,
  ReportPageRoute,
} from "./Routes/AdminRoutes/AdminRoutes";
import {
  UserLoginRoute,
  UserRegistrationRoute,
  UserBookingFormRoute,
  UserAdoptionFormRoute,
  UserForgotPasswordRoute,
  UserMainRoute,
} from "./Routes/UserRoutes/UserRoutes";
import { PetRoute } from "./Routes/PetRoutes/PetRoutes";

const routers = createBrowserRouter([
  PetRoute,
  DashboardRoute,
  UserMainRoute,
  AdoptionRequestRoute,
  AppointmentPageRoute,
  MessagesPageRoute,
  UserLoginRoute,
  UserRegistrationRoute,
  UserBookingFormRoute,
  UserForgotPasswordRoute,
  UserAdoptionFormRoute,
  ReportPageRoute,
]);

function App() {
  return (
    <AnimatePresence mode="wait">
      <RouterProvider router={routers} />
    </AnimatePresence>
  );
}

export default App;
