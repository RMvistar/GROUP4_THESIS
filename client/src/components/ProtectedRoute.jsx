import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/home" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
