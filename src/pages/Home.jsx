import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";
import axios from "axios";
import API_URL from "../constants/api_url";

const Home = () => {
  const [courseLength, setCourseLength] = useState(0);
  const [studentsLength, setStudentsLength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
    const role = localStorage.getItem('role');

  const handleGetCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/student/get-all-courses`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setCourseLength(response.data.courses?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setErrorMsg("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGetStudents = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/get-students`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        if (response.status === 200) {
          setStudentsLength(response.data.students?.length || 0);
        }
      } catch (error) {
        console.log(`Something went wrong! ${error}`);
      }
    };

  useEffect(() => {
    handleGetCourses();
    handleGetStudents();
  }, [])

  return (
    <div className="landing-page d-flex flex-column min-vh-100">
      
      {/* Hero Section */}
      <header className="hero-section text-white text-center py-5 flex-grow-1 d-flex flex-column justify-content-center">
        <div className="container py-5">
          <div className="hero-badge mb-4">
            <span className="badge-custom">✨ Next-Gen Learning Platform</span>
          </div>
          <h1 className="display-3 fw-bold mb-3 hero-title">
            Welcome to <span className="hero-highlight">Academic Bridge</span>
          </h1>
          <p className="lead mb-4 mx-auto hero-description" style={{ maxWidth: "700px" }}>
            A centralized digital platform designed to manage academic activities, 
            courses, assignments, quizzes, and results in an organized and efficient way.
          </p>
          <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
            <Link to={`${role}/dashboard`} className="btn btn-cta-primary btn-lg px-5 py-3 fw-bold">
              🚀 Get Started
            </Link>
         
          </div>
          
          {/* Stats Section */}
          <div className="row stats-row mt-5 pt-4 d-flex">
            <div className="col-md-4 mb-3 stat-item">
                <div className="stat-icon">📚</div>
                  <h3 className="stat-number"> {isLoading ? "..." : courseLength}+</h3>
                <p className="stat-label">Active Courses</p>
            </div>
            <div className="col-md-4 mb-3 stat-item">
                <div className="stat-icon">👨‍🎓</div>
                <h3 className="stat-number">{isLoading ? "..." : studentsLength}+</h3>
                <p className="stat-label">Enrolled Students</p>
            </div>
            <div className="col-md-4 mb-3 stat-item">
                <div className="stat-icon">⏰</div>
                <h3 className="stat-number">24/7</h3>
                <p className="stat-label">Learning Access</p>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section py-5 flex-grow-1">
        <div className="container py-4">
          <div className="row text-center mb-5">
            <div className="col">
              <span className="section-badge">What We Offer</span>
              <h2 className="fw-bold section-title">Key System Features</h2>
              <p className="section-subtitle">Everything you need to streamline the academic experience.</p>
            </div>
          </div>
          
          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">📚</div>
                </div>
                <div className="feature-content">
                  <h5 className="feature-title">Course Management</h5>
                  <p className="feature-text">
                    Access enrolled courses, download study materials, and stay organized with a structured academic curriculum.
                  </p>
                  <div className="feature-link">
                    <span className="learn-more">Learn more →</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">📝</div>
                </div>
                <div className="feature-content">
                  <h5 className="feature-title">Assignments & Quizzes</h5>
                  <p className="feature-text">
                    Submit assignments digitally before deadlines and attempt interactive online quizzes for quick evaluation.
                  </p>
                  <div className="feature-link">
                    <span className="learn-more">Learn more →</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">📊</div>
                </div>
                <div className="feature-content">
                  <h5 className="feature-title">Results & Announcements</h5>
                  <p className="feature-text">
                    Receive immediate notifications for important updates and track your performance with downloadable result reports.
                  </p>
                  <div className="feature-link">
                    <span className="learn-more">Learn more →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features Row */}
          <div className="row g-4 mt-2">
            <div className="col-md-4">
              <div className="feature-card feature-card-light">
                <div className="feature-icon-wrapper small">
                  <div className="feature-icon">✅</div>
                </div>
                <div className="feature-content">
                  <h5 className="feature-title">Easy Submission</h5>
                  <p className="feature-text">
                    Submit assignments and quizzes with just a few clicks. Track your submissions and never miss a deadline.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card feature-card-light">
                <div className="feature-icon-wrapper small">
                  <div className="feature-icon">📈</div>
                </div>
                <div className="feature-content">
                  <h5 className="feature-title">Performance Analytics</h5>
                  <p className="feature-text">
                    Visualize your academic progress with detailed charts and analytics. Identify strengths and areas for improvement.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card feature-card-light">
                <div className="feature-icon-wrapper small">
                  <div className="feature-icon">🔔</div>
                </div>
                <div className="feature-content">
                  <h5 className="feature-title">Instant Notifications</h5>
                  <p className="feature-text">
                    Stay updated with real-time notifications for deadlines, announcements, and grade releases.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
         {
          role === 'student' &&
          <div className="info-banner mt-5 p-4 rounded-4">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h4 className="text-white mb-2">Ready to start your academic journey?</h4>
                <p className="text-white-50 mb-0">Join thousands of students already using Academic Bridge</p>
              </div>
              <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                <Link to="/student/courses" className="btn btn-banner-cta px-4 py-2 fw-bold">
                  Join Now →
                </Link>
              </div>
            </div>
          </div>}

          {
            role === 'admin' &&
            <div className="info-banner mt-5 p-4 rounded-4">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <h4 className="text-white mb-2">Manage your academic portal efficiently</h4>
                  <p className="text-white-50 mb-0">
                    Oversee students, courses, assignments, quizzes, and announcements from one dashboard
                  </p>
                </div>
                <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                  <Link to="/admin/dashboard" className="btn btn-banner-cta px-4 py-2 fw-bold">
                    Manage Now →
                  </Link>
                </div>
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  );
};

export default Home;