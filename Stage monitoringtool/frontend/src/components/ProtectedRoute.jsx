//imports
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

//route inloggen
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {return <Navigate to="/login" />}
  return children;
}

export default ProtectedRoute;