import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Usage: <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
// Omit `roles` to just require any logged-in user.
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
