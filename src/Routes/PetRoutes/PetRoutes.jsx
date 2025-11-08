import PetPage from "../../Pet-Pages/Admin-Page/PetPage";
import ProtectedRoute from "../../Components/RouteGuard/NoRoute";

const PetRoute = {
  path: "/admin/pet",
  element: (
    <ProtectedRoute>
      <PetPage />
    </ProtectedRoute>
  ),
};

export { PetRoute };
