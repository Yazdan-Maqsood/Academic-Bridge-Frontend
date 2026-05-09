import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";
import logo from "../../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
 const role = localStorage.getItem('role');

  return (
    <footer className="custom-footer">
      <div className="footer-container">
        
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-section">
            <div className="footer-logo">
              <img src={logo} alt="GGCWS Portal" style={{ height: '3rem', width: "150px" }} />
            </div>
            <p className="footer-description">
              A centralized digital platform designed to manage academic activities, 
              courses, assignments, quizzes, and results in an organized and efficient way.
            </p>
            {/* <div className="footer-social">
              <a href="#" className="social-icon" aria-label="Facebook">📘</a>
              <a href="#" className="social-icon" aria-label="Twitter">🐦</a>
              <a href="#" className="social-icon" aria-label="LinkedIn">🔗</a>
              <a href="#" className="social-icon" aria-label="Instagram">📷</a>
            </div> */}
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
            </ul>
          </div>

          {
            role === 'student' &&
            <div className="footer-section">
            <h4 className="footer-heading">Features</h4>
            <ul className="footer-links">
              <li><Link to={`/${role}/courses`}>Courses</Link></li>
              <li><Link to={`/${role}/assignments`}>Assignments</Link></li>
              <li><Link to={`/${role}/quizzes`}>Quizzes</Link></li>
              <li><Link to={`/${role}/results`}>Results & Analytics</Link></li>
              <li><Link to={`/${role}/announcements`}>Announcements</Link></li>
            </ul>
          </div>}

          {
            role === 'admin' &&
            <div className="footer-section">
              <h4 className="footer-heading">Features</h4>
              <ul className="footer-links">
                <li><Link to={`/${role}/manage-courses`}>Manage Courses</Link></li>
                <li><Link to={`/${role}/manage-assignments`}>Manage Assignments</Link></li>
                <li><Link to={`/${role}/manage-quizzes`}>Manage Quizzes</Link></li>
                <li><Link to={`/${role}/manage-results`}>Manage Results & Analytics</Link></li>
                <li><Link to={`/${role}/manage-announcements`}>Manage Announcements</Link></li>
              </ul>
            </div>
          }

          <div className="footer-section">
            <h4 className="footer-heading">Contact Info</h4>
            <ul className="footer-contact">
              <li>
                <span className="contact-icon">📍</span>
                <span>123 Education Street, Islamabad, Pakistan</span>
              </li>
              <li>
                <span className="contact-icon">📞</span>
                <span>+92 300 1234567</span>
              </li>
              <li>
                <span className="contact-icon">✉️</span>
                <span>support@ggcws.edu.pk</span>
              </li>
              <li>
                <span className="contact-icon">🕐</span>
                <span>Mon - Fri, 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} Academic Bridge Student Portal. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Help Center</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;