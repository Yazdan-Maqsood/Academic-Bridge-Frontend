import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./signup.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import API_URL from "../constants/api_url";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "student",
    status: "Active",
    department: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("File size must be less than 2MB");
        return;
      }
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg("Please select a valid image file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("password", formData.password);
      data.append("role", "student");
      data.append("status", "Active");
      data.append("department", formData.department || "General");
      
      if (selectedFile) {
        data.append("profilePicture", selectedFile);
      }

      const response = await axios.post(`${API_URL}/signup`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.status === 201) {
        alert("Account created successfully! Please login.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMsg(error.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h3 className="signup-title">Student Registration</h3>
        <p className="signup-subtitle">Create your account to get started</p>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Full Name and Email */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Phone and Department */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-control"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department (Optional)</label>
              <select
                className="form-control"
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="General">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>

          {/* Row 3: Password (full width) */}
          <div className="form-row-full">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  placeholder="Enter password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              <small className="text-muted">Password must be at least 6 characters long</small>
            </div>
          </div>

          {/* Row 4: Profile Picture (full width) */}
          <div className="form-row-full">
            <div className="form-group">
              <label className="form-label">Profile Picture (Optional)</label>
              <input
                type="file"
                className="form-control"
                onChange={handleFileChange}
                accept="image/png,image/jpg,image/jpeg,image/gif"
              />
              {selectedFile && <p className="file-info">Selected: {selectedFile.name}</p>}
              <small className="text-muted">Max size: 2MB. Formats: PNG, JPG, JPEG, GIF</small>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="signup-btn" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="signup-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;