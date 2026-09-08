import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const { user, checkingAuth } = useUserStore();
  const location = useLocation();

  if (checkingAuth) {
    return <LoadingSpinner />;
  }
  
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
