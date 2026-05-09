import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./adminProfile.css";

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    id: "",
    adminName: "",
    adminEmail: "",
    role: "",
    profilePicture: "",
    phone: "",
    joinDate: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [editFormData, setEditFormData] = useState({
    adminName: "",
    adminEmail: "",
    phone: "",
  });
  
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch admin profile
  const handleGetProfile = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/admin/get-profile`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setProfile(response.data.profile);
        setEditFormData({
          adminName: response.data.profile.adminName,
          adminEmail: response.data.profile.adminEmail,
          phone: response.data.profile.phone || "",
        });
        if (response.data.profile.profilePicture) {
          const normalizedPath = response.data.profile.profilePicture.replace(/\\/g, '/');
          setImagePreview(`${API_URL}/${normalizedPath}`);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setErrorMsg("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      setIsLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("adminName", editFormData.adminName);
      formData.append("adminEmail", editFormData.adminEmail);
      formData.append("phone", editFormData.phone);
      if (profileImage) {
        formData.append("profilePicture", profileImage);
      }
      
      const response = await axios.put(`${API_URL}/admin/update-profile`, formData, {
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
      const response = await axios.put(`${API_URL}/admin/change-password`, {
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
    if (profile.adminName) {
      return profile.adminName.charAt(0).toUpperCase();
    }
    return "A";
  };

  useEffect(() => {
    handleGetProfile();
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
    <div className="admin-profile">
      <div className="profile-container">
        
        {/* Header Banner */}
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">Admin Profile 👨‍💼</h1>
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
                      adminName: profile.adminName,
                      adminEmail: profile.adminEmail,
                      phone: profile.phone || "",
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
                <h2 className="profile-name">{profile.adminName || "Admin User"}</h2>
                <p className="profile-role">{profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Administrator"}</p>
              </div>

              <div className="profile-quick-info">
                <div className="quick-info-item">
                  <span className="quick-icon">📧</span>
                  <div>
                    <label>Email</label>
                    <p>{profile.adminEmail || "Not set"}</p>
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

          {/* Right Column - Profile Details Form */}
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
                      name="adminName"
                      className="form-input"
                      value={editFormData.adminName}
                      onChange={handleEditInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  ) : (
                    <p className="form-value">{profile.adminName || "Not set"}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📧</span>
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="adminEmail"
                      className="form-input"
                      value={editFormData.adminEmail}
                      onChange={handleEditInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  ) : (
                    <p className="form-value">{profile.adminEmail || "Not set"}</p>
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

                {!isEditing && (
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">👔</span>
                      Role
                    </label>
                    <p className="form-value form-value-badge">
                      <span className="role-badge">{profile.role || "Administrator"}</span>
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Account Statistics */}
            <div className="profile-card">
              <h3 className="section-title">Account Statistics</h3>
              <div className="stats-grid-mini">
                <div className="mini-stat">
                  <div className="mini-stat-icon">📚</div>
                  <div className="mini-stat-info">
                    <span className="mini-stat-label">Courses Managed</span>
                    <span className="mini-stat-value">—</span>
                  </div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-icon">👨‍🎓</div>
                  <div className="mini-stat-info">
                    <span className="mini-stat-label">Students Managed</span>
                    <span className="mini-stat-value">—</span>
                  </div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-icon">📋</div>
                  <div className="mini-stat-info">
                    <span className="mini-stat-label">Quizzes Created</span>
                    <span className="mini-stat-value">—</span>
                  </div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-icon">📝</div>
                  <div className="mini-stat-info">
                    <span className="mini-stat-label">Assignments Created</span>
                    <span className="mini-stat-value">—</span>
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

export default AdminProfile;