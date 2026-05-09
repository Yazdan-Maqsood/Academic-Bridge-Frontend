import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./studentProfile.css";

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    id: "",
    studentName: "",
    studentEmail: "",
    rollNumber: "",
    phone: "",
    department: "",
    profilePicture: "",
    enroll_courses: 0,
    status: "",
    joinDate: "",
  });
  
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalQuizzes: 0,
    averageScore: 0,
    totalAssignments: 0,
    submittedAssignments: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [editFormData, setEditFormData] = useState({
    studentName: "",
    studentEmail: "",
    phone: "",
    department: ""
  });
  
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch student profile
  const handleGetProfile = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/student/get-profile`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setProfile(response.data.profile);
        setEditFormData({
          studentName: response.data.profile.studentName,
          studentEmail: response.data.profile.studentEmail,
          phone: response.data.profile.phone || "",
          department: response.data.profile.department || ""
        });
        if (response.data.profile.profilePicture) {
          const normalizedPath = response.data.profile.profilePicture.replace(/\\/g, '/');
          setImagePreview(`${API_URL}/${normalizedPath}`);
        }
      }
    }
     catch (error) {
      console.error("Error fetching profile:", error);
      setErrorMsg("Failed to load profile");
    }
     finally {
      setIsLoading(false);
    }
  };

  // Fetch student statistics
  const handleGetStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/get-stats`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append("studentName", editFormData.studentName);
      formData.append("studentEmail", editFormData.studentEmail);
      formData.append("phone", editFormData.phone);
      formData.append("department", editFormData.department);
      if (profileImage) {
        formData.append("profilePicture", profileImage);
      }
      
      const response = await axios.put(`${API_URL}/student/update-profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setProfile(response.data.profile);
        setSuccessMsg("Profile updated successfully!");
        setIsEditing(false);
        setProfileImage(null);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    // Validate passwords
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setErrorMsg("New passwords do not match");
      return;
    }
    
    if (passwordFormData.newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/student/change-password`, {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      }, {
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setSuccessMsg("Password changed successfully!");
        setShowPasswordModal(false);
        setPasswordFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg("Please select a valid image file (JPEG, PNG, GIF)");
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Image size must be less than 2MB");
        return;
      }
      
      setProfileImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Handle input changes
  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handlePasswordInputChange = (e) => {
    setPasswordFormData({ ...passwordFormData, [e.target.name]: e.target.value });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get initial for avatar
  const getInitial = () => {
    if (profile.studentName) {
      return profile.studentName.charAt(0).toUpperCase();
    }
    return "S";
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  useEffect(() => {
    handleGetProfile();
    handleGetStats();
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  return (
    <div className="student-profile">
      <div className="profile-container">
        
        {/* Header Banner */}
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">Student Profile 👨‍🎓</h1>
              <p className="header-subtitle">View and manage your profile information and account settings.</p>
            </div>
            {!isEditing ? (
              <button 
                className="btn-edit-profile"
                onClick={() => setIsEditing(true)}
              >
                <span className="btn-icon">✏️</span>
                Edit Profile
              </button>
            ) : (
              <div className="action-buttons">
                <button 
                  className="btn-cancel-edit"
                  onClick={() => {
                    setIsEditing(false);
                    setEditFormData({
                      studentName: profile.studentName,
                      studentEmail: profile.studentEmail,
                      phone: profile.phone || "",
                      department: profile.department || ""
                    });
                    setProfileImage(null);
                    setImagePreview(profile.profilePicture ? `${API_URL}${profile.profilePicture}` : null);
                    setErrorMsg("");
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-save-profile"
                  form="profile-form"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMsg && (
          <div className="alert-success">
            <span className="alert-icon">✅</span>
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="alert-error">
            <span className="alert-icon">❌</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Content */}
        <div className="profile-grid">
          
          {/* Left Column - Profile Picture & Quick Info */}
          <div className="profile-left">
            <div className="profile-card">
              <div className="profile-image-section">
                <div className="profile-image-wrapper">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="profile-image" />
                  ) : (
                    <div className="profile-image-placeholder">
                      <span className="profile-initial">{getInitial()}</span>
                    </div>
                  )}
                  {isEditing && (
                    <label className="image-upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="image-upload-input"
                      />
                      <span className="image-upload-icon">📷</span>
                    </label>
                  )}
                </div>
                <h2 className="profile-name">{profile.studentName || "Student"}</h2>
                <p className="profile-roll">{profile.rollNumber || "Roll No: Not Set"}</p>
                <div className="profile-status">
                  <span className={`status-badge ${getStatusClass(profile.status)}`}>
                    {profile.status || 'Active'}
                  </span>
                </div>
              </div>

              <div className="profile-quick-info">
                <div className="quick-info-item">
                  <span className="quick-icon">📧</span>
                  <div>
                    <label>Email</label>
                    <p>{profile.studentEmail || "Not set"}</p>
                  </div>
                </div>
                <div className="quick-info-item">
                  <span className="quick-icon">📞</span>
                  <div>
                    <label>Phone</label>
                    <p>{profile.phone || "Not set"}</p>
                  </div>
                </div>
                <div className="quick-info-item">
                  <span className="quick-icon">🏛️</span>
                  <div>
                    <label>Department</label>
                    <p>{profile.department || "Not set"}</p>
                  </div>
                </div>
                <div className="quick-info-item">
                  <span className="quick-icon">📅</span>
                  <div>
                    <label>Joined</label>
                    <p>{formatDate(profile.joinDate)}</p>
                  </div>
                </div>
              </div>

              <button 
                className="btn-change-password"
                onClick={() => setShowPasswordModal(true)}
              >
                <span className="btn-icon">🔒</span>
                Change Password
              </button>
            </div>
          </div>

          {/* Right Column - Profile Details Form & Stats */}
          <div className="profile-right">
            <div className="profile-card">
              <h3 className="section-title">Profile Information</h3>
              
              <form id="profile-form" onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">👤</span>
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="studentName"
                      className="form-input"
                      value={editFormData.studentName}
                      onChange={handleEditInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  ) : (
                    <p className="form-value">{profile.studentName || "Not set"}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🎓</span>
                    Roll Number
                  </label>
                  <p className="form-value form-value-disabled">{profile.rollNumber || "Not set"}</p>
                  <small className="form-hint">Roll number cannot be changed</small>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📧</span>
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="studentEmail"
                      className="form-input"
                      value={editFormData.studentEmail}
                      onChange={handleEditInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  ) : (
                    <p className="form-value">{profile.studentEmail || "Not set"}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📞</span>
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={editFormData.phone}
                      onChange={handleEditInputChange}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="form-value">{profile.phone || "Not set"}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🏛️</span>
                    Department
                  </label>
                  {isEditing ? (
                    <select
                      name="department"
                      className="form-input"
                      value={editFormData.department}
                      onChange={handleEditInputChange}
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Business Administration">Business Administration</option>
                    </select>
                  ) : (
                    <p className="form-value">{profile.department || "Not set"}</p>
                  )}
                </div>

                 {!isEditing && (
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">👔</span>
                      Role
                    </label>
                    <p className="form-value form-value-badge">
                      <span className="role-badge"> {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Student"}</span>
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Academic Statistics */}
            <div className="profile-card">
              <h3 className="section-title">Academic Statistics</h3>
              <div className="stats-grid-mini">
                <div className="mini-stat">
                  <div className="mini-stat-icon">📚</div>
                  <div className="mini-stat-info">
                    <span className="mini-stat-label">Enrolled Courses</span>
                    <span className="mini-stat-value">{stats.totalCourses || profile.enroll_courses || 0}</span>
                  </div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-icon">✅</div>
                  <div className="mini-stat-info">
                    <span className="mini-stat-label">Completed Courses</span>
                    <span className="mini-stat-value">{stats.completedCourses || 0}</span>
                  </div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-icon">📋</div>
                  <div className="mini-stat-info">
                    <span className="mini-stat-label">Quizzes Taken</span>
                    <span className="mini-stat-value">{stats.totalQuizzes || 0}</span>
                  </div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-icon">📊</div>
                  <div className="mini-stat-info">
                    <span className="mini-stat-label">Average Score</span>
                    <span className="mini-stat-value">{stats.averageScore || 0}%</span>
                  </div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-icon">📝</div>
                  <div className="mini-stat-info">
                    <span className="mini-stat-label">Assignments</span>
                    <span className="mini-stat-value">{stats.submittedAssignments || 0}/{stats.totalAssignments || 0}</span>
                  </div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-icon">⭐</div>
                  <div className="mini-stat-info">
                    <span className="mini-stat-label">Overall Progress</span>
                    <span className="mini-stat-value">
                      {stats.totalCourses > 0 ? Math.round((stats.completedCourses / stats.totalCourses) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Change Password</h3>
                  <p className="modal-subtitle">Update your account password</p>
                </div>
                <button className="modal-close" onClick={() => setShowPasswordModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                <form onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">🔐</span>
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      className="form-input"
                      value={passwordFormData.currentPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Enter your current password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">🔑</span>
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      className="form-input"
                      value={passwordFormData.newPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Enter new password (min 6 characters)"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">✓</span>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-input"
                      value={passwordFormData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>

                  <div className="password-requirements">
                    <p className="requirements-title">Password Requirements:</p>
                    <ul>
                      <li>Minimum 6 characters long</li>
                      <li>Should contain at least one uppercase letter</li>
                      <li>Should contain at least one number</li>
                    </ul>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowPasswordModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                      {isLoading ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;