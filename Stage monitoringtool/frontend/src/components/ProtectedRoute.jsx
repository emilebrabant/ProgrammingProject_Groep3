//imports
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

//route inloggen
const ProtectedRoute = ({ children, allowedRoles = [], allowFirstLoginBypass = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-vh-100 d-flex align-items-center justify-content-center">Laden...</div>;
  }

  if (!user) {return <Navigate to="/login" replace />}

  if (user.eerste_login && !allowFirstLoginBypass && location.pathname !== '/change-password-first-login') {
    return <Navigate to="/change-password-first-login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;