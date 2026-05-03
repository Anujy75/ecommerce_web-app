import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  // Agar token nahi hai → Login portal pe bhejo
  if (!token) {
    return <Navigate to="/portal" replace />;
  }
  
  // Agar allowedRoles specified hain aur current role allowed nahi hai → Access Denied
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/portal" replace />;
  }
  
  return children;
};

export default ProtectedRoute;