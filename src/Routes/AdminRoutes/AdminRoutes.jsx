import DashboardPage from "../../Pages/Dashboard/DashboardPage";
import AdoptionRequestPage from "../../Pages/Adoption/AdoptionRequest";
import AppointmentPage from "../../Pages/Appointment/AppointmentPage";
import MessagesPage from "../../Pages/MessagePage/MessagesPage";
import ProtectedRoute from "../../Components/RouteGuard/NoRoute";
import ReportPage from "../../Pages/Report/ReportPage";

const DashboardRoute = {
  path: "/admin/dashboard",
  element: (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
};

const AdoptionRequestRoute = {
  path: "/admin/adoption",
  element: (
    <ProtectedRoute>
      <AdoptionRequestPage />
    </ProtectedRoute>
  ),
};

const AppointmentPageRoute = {
  path: "/admin/appointment",
  element: (
    <ProtectedRoute>
      <AppointmentPage />
    </ProtectedRoute>
  ),
};

const MessagesPageRoute = {
  path: "/admin/message",
  element: (
    <ProtectedRoute>
      <MessagesPage />
    </ProtectedRoute>
  ),
};

const ReportPageRoute = {
  path: "/admin/reports",
  element: (
    <ProtectedRoute>
      <ReportPage />
    </ProtectedRoute>
  ),
};

export {
  DashboardRoute,
  AdoptionRequestRoute,
  AppointmentPageRoute,
  MessagesPageRoute,
  ReportPageRoute,
};
