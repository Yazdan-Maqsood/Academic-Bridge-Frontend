import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import API_URL from "../../constants/api_url";
import "./navbar.css";
import axios from "axios";
import logo from "../../assets/logo.png";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [role, setRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Helper function to check if link is active
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Check authentication on mount and when route changes
    const checkAuth = async () => {
        try {
            const response = await axios.get(`${API_URL}/me`, {
                withCredentials: true,
            });
            if (response.status === 200 && response.data) {
                setIsAuthenticated(true);
                setRole(response.data.role);
                localStorage.setItem('role', response.data.role);
            } else {
                setIsAuthenticated(false);
                setRole(null);
                localStorage.removeItem('role');
            }
        } catch (err) {
            setIsAuthenticated(false);
            setRole(null);
            localStorage.removeItem('role');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await axios.post(`${API_URL}/logout`, {}, {
                withCredentials: true
            });
            localStorage.removeItem("role");
            setIsAuthenticated(false);
            setRole(null);
            navigate("/login");
        } catch (err) {
            console.log("Logout error:", err);
        }
    };

    const handleRegistration = () => {
        navigate(`/signup`);
    };

    if (isLoading) {
        return (
            <nav className="navbar navbar-expand-lg custom-navbar">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">
                        <img src={logo} alt="" style={{ height: '3.5rem', width: "170px" }} />
                    </Link>
                </div>
            </nav>
        );
    }

    return (
        <nav className="navbar navbar-expand-lg custom-navbar">
            <div className="container-fluid">
                
                <Link className="navbar-brand" to="/">
                    <img src={logo} alt="" style={{ height: '3.5rem', width: "170px" }} />
                </Link>

                <button
                    className="navbar-toggler bg-light"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav ms-auto align-items-center">
                        {/* Home Link */}
                        {isAuthenticated && (
                            <li className="nav-item">
                                <Link 
                                    className={`nav-link ${isActive('/') ? 'active' : ''}`} 
                                    to="/"
                                >
                                    Home
                                </Link>
                            </li>
                        )}
                        
                        {/* Admin Links */}
                        {role === "admin" && (
                            <>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`} 
                                        to="/admin/dashboard"
                                    >
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/admin/manage-students') ? 'active' : ''}`} 
                                        to="/admin/manage-students"
                                    >
                                        Students
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/admin/manage-courses') ? 'active' : ''}`} 
                                        to="/admin/manage-courses"
                                    >
                                        Courses
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/admin/manage-assignments') ? 'active' : ''}`} 
                                        to="/admin/manage-assignments"
                                    >
                                        Assignments
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/admin/manage-quizzes') ? 'active' : ''}`} 
                                        to="/admin/manage-quizzes"
                                    >
                                        Quizzes
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/admin/manage-results') ? 'active' : ''}`} 
                                        to="/admin/manage-results"
                                    >
                                        Results
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/admin/manage-announcements') ? 'active' : ''}`} 
                                        to="/admin/manage-announcements"
                                    >
                                        Announcements
                                    </Link>
                                </li>
                                <li className="nav-item" style={{marginRight: '20px'}}>
                                    <Link 
                                        className={`nav-link ${isActive('/admin/profile') ? 'active' : ''}`} 
                                        to="/admin/profile"
                                    >
                                        Profile
                                    </Link>
                                </li>
                            </>
                        )}

                        {/* Student Links */}
                        {role === "student" && (
                            <>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/student/dashboard') ? 'active' : ''}`} 
                                        to="/student/dashboard"
                                    >
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/student/courses') ? 'active' : ''}`} 
                                        to="/student/courses"
                                    >
                                        Courses
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/student/assignments') ? 'active' : ''}`} 
                                        to="/student/assignments"
                                    >
                                        Assignments
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/student/quizzes') ? 'active' : ''}`} 
                                        to="/student/quizzes"
                                    >
                                        Quizzes
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/student/results') ? 'active' : ''}`} 
                                        to="/student/results"
                                    >
                                        Results
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/student/announcements') ? 'active' : ''}`} 
                                        to="/student/announcements"
                                    >
                                        Announcements
                                    </Link>
                                </li>
                                <li className="nav-item" style={{marginRight: '20px'}}>
                                    <Link 
                                        className={`nav-link ${isActive('/student/profile') ? 'active' : ''}`} 
                                        to="/student/profile"
                                    >
                                        Profile
                                    </Link>
                                </li>
                            </>
                        )}
                        
                        {/* Auth Buttons */}
                        {!isAuthenticated ? (
                            <li className="nav-item auth-buttons">
                                <button className="registration-btn" onClick={handleRegistration}>
                                    Registration
                                </button>
                                <button className="login-btn" onClick={() => navigate("/login")}>
                                    Login
                                </button>
                            </li>
                        ) : (
                            <li className="nav-item">
                                <button className="logout-btn" onClick={handleLogout}>
                                    Logout
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;