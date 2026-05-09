import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../constants/api_url";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuth, setIsAuth] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/me`, {
          withCredentials: true,
        });
        
        if (response.status === 200 && response.data) {
          setIsAuth(true);
          setUserRole(response.data.role);
        } else {
          setIsAuth(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuth) {
    // Clear any stale role from localStorage
    localStorage.removeItem("role");
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if requiredRole is provided
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;