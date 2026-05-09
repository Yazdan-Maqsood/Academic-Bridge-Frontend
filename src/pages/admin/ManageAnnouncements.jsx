import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./manageAnnouncements.css";

const ManageAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    courseId: "",
    announcementType: "General",
    priority: "Normal",
    validFrom: "",
    validTo: "",
    attachment: null
  });
  
  const [editFormData, setEditFormData] = useState({
    id: "",
    title: "",
    content: "",
    courseId: "",
    announcementType: "",
    priority: "",
    validFrom: "",
    validTo: "",
    status: "Active"
  });

  // Fetch all announcements
  const handleGetAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/admin/get-announcements`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setAnnouncements(response.data.announcements);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setErrorMsg("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch courses for dropdown
  const handleGetCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/get-courses`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Add new announcement
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("courseId", formData.courseId);
      formDataToSend.append("announcementType", formData.announcementType);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("validFrom", formData.validFrom?.split("T")[0]);
      formDataToSend.append("validTo", formData.validTo?.split("T")[0]);
      if (formData.attachment) {
        formDataToSend.append("attachment", formData.attachment);
      }

      const response = await axios.post(`${API_URL}/admin/add-announcement`, formDataToSend, {
         withCredentials: true });
      
      if (response.status === 201) {
        setAnnouncements([response.data.announcement, ...announcements]);
        setShowModal(false);
        resetForm();
        alert("Announcement added successfully!");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to add announcement");
    } finally {
      setIsLoading(false);
    }
  };

  // Update announcement
  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/admin/update-announcement/${editFormData.id}`, editFormData, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        setAnnouncements(announcements.map(announcement => 
          announcement.id === editFormData.id ? response.data.announcement : announcement
        ));
        setShowEditModal(false);
        resetEditForm();
        alert("Announcement updated successfully!");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to update announcement");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete announcement
  const handleDeleteAnnouncement = async (announcementId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.delete(`${API_URL}/admin/delete-announcement/${announcementId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setAnnouncements(announcements.filter(announcement => announcement.id !== announcementId));
        alert("Announcement deleted successfully!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "Failed to delete announcement");
    } finally {
      setIsLoading(false);
    }
  };

  // View announcement details
  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowViewModal(true);
  };

  // Open edit modal with announcement data
  const handleEditClick = (announcement) => {
    setEditFormData({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      courseId: announcement.courseId || "",
      announcementType: announcement.announcementType,
      priority: announcement.priority,
      validFrom: announcement.validFrom?.split('T')[0] || "",
      validTo: announcement.validTo?.split('T')[0] || "",
      status: announcement.status
    });
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      courseId: "",
      announcementType: "General",
      priority: "Normal",
      validFrom: "",
      validTo: "",
      attachment: null
    });
  };

  const resetEditForm = () => {
    setEditFormData({
      id: "",
      title: "",
      content: "",
      courseId: "",
      announcementType: "",
      priority: "",
      validFrom: "",
      validTo: "",
      status: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment") {
      setFormData({ ...formData, attachment: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Get course name by ID
  const getCourseName = (courseId) => {
    if (!courseId) return "All Students";
    const course = courses.find(c => c.id == courseId);
    return course ? course.courseName : "Unknown Course";
  };

  // Get priority badge class
  const getPriorityClass = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'normal': return 'priority-normal';
      default: return 'priority-normal';
    }
  };

  // Get announcement type badge class
  const getTypeClass = (type) => {
    switch(type?.toLowerCase()) {
      case 'exam': return 'type-exam';
      case 'event': return 'type-event';
      case 'holiday': return 'type-holiday';
      case 'general': return 'type-general';
      default: return 'type-general';
    }
  };

  // Check if announcement is active
  const isActive = (validFrom, validTo) => {
    const now = new Date();
    const from = validFrom ? new Date(validFrom) : null;
    const to = validTo ? new Date(validTo) : null;
    
    if (from && to) {
      return now >= from && now <= to;
    }
    if (from) {
      return now >= from;
    }
    if (to) {
      return now <= to;
    }
    return true;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No expiry";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  // Filter announcements based on search and course
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = !selectedCourse || announcement.courseId == selectedCourse;
    
    return matchesSearch && matchesCourse;
  });

  // Statistics
  const totalAnnouncements = filteredAnnouncements.length;
  const activeAnnouncements = filteredAnnouncements.filter(a => isActive(a.validFrom, a.validTo) && a.status === 'Active').length;
  const highPriorityCount = filteredAnnouncements.filter(a => a.priority === 'High').length;
  const generalCount = filteredAnnouncements.filter(a => a.announcementType === 'General').length;

  useEffect(() => {
    handleGetAnnouncements();
    handleGetCourses();
  }, []);

  return (
    <div className="manage-announcements" >
      <div className="announcements-container">
        
        {/* Header Banner */}
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">Manage Announcements 📢</h1>
              <p className="header-subtitle">Create, edit, and manage important announcements for students.</p>
            </div>
            <button 
              className="btn-add-announcement"
              onClick={() => setShowModal(true)}
            >
              <span className="btn-icon">➕</span>
              Post New Announcement
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid mb-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">📢</div>
            <div className="stat-info">
              <p className="stat-label">Total Announcements</p>
              <h3 className="stat-value">{totalAnnouncements}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <p className="stat-label">Active</p>
              <h3 className="stat-value">{activeAnnouncements}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <p className="stat-label">High Priority</p>
              <h3 className="stat-value">{highPriorityCount}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <p className="stat-label">General</p>
              <h3 className="stat-value">{generalCount}</h3>
            </div>
          </div>
        </div>

        {/* Announcements Card */}
        <div className="announcements-card">
          <div className="card-header-custom">
            <div>
              <h3 className="card-title">Announcement Board</h3>
              <p className="card-subtitle">Showing {filteredAnnouncements.length} of {announcements.length} announcements</p>
            </div>
            <div className="filter-section">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search announcements..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="filter-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                <option value="all-students">All Students</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.courseName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading announcements...</p>
            </div>
          ) : (
            <div className="announcements-list">
              {filteredAnnouncements.map((announcement) => (
                <div key={announcement.id} className={`announcement-item priority-${announcement.priority?.toLowerCase()}`}>
                  <div className="announcement-badge">
                    <span className={`priority-badge ${getPriorityClass(announcement.priority)}`}>
                      {announcement.priority || 'Normal'}
                    </span>
                    <span className={`type-badge ${getTypeClass(announcement.announcementType)}`}>
                      {announcement.announcementType || 'General'}
                    </span>
                    {!isActive(announcement.validFrom, announcement.validTo) && (
                      <span className="expired-badge">Expired</span>
                    )}
                  </div>
                  
                  <div className="announcement-content">
                    <h3 className="announcement-title">{announcement.title}</h3>
                    <p className="announcement-text">{announcement.content}</p>
                    
                    <div className="announcement-meta">
                      <div className="meta-item">
                        <span className="meta-icon">🎯</span>
                        <span>{getCourseName(announcement.courseId)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span>Posted: {getRelativeTime(announcement.createdAt)}</span>
                      </div>
                      {announcement.validTo && (
                        <div className="meta-item">
                          <span className="meta-icon">⏰</span>
                          <span>Valid until: {formatDate(announcement.validTo)}</span>
                        </div>
                      )}
                      <div className="meta-item">
                        <span className={`status-badge status-${announcement.status?.toLowerCase()}`}>
                          {announcement.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="announcement-actions">
                    <button 
                      className="action-btn view-btn" 
                      title="View Details"
                      onClick={() => handleViewAnnouncement(announcement)}
                    >
                      👁️
                    </button>
                    <button 
                      className="action-btn edit-btn" 
                      title="Edit Announcement"
                      onClick={() => handleEditClick(announcement)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      title="Delete Announcement"
                      onClick={() => handleDeleteAnnouncement(announcement.id, announcement.title)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredAnnouncements.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-content">
                    <div className="empty-icon">📢</div>
                    <p className="empty-text">
                      {searchTerm || selectedCourse ? "No matching announcements found" : "No announcements yet"}
                    </p>
                    <p className="empty-subtext">
                      {searchTerm || selectedCourse 
                        ? "Try adjusting your filters" 
                        : 'Click the "Post New Announcement" button to create one.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Announcement Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Post New Announcement</h3>
                  <p className="modal-subtitle">Create an announcement for students</p>
                </div>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                <form onSubmit={handleAddAnnouncement}>
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📌</span>
                      Announcement Title
                    </label>
                    <input 
                      type="text" 
                      className="form-input"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter announcement title"
                      required 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">🏷️</span>
                        Announcement Type
                      </label>
                      <select
                        name="announcementType"
                        value={formData.announcementType}
                        className="form-input"
                        onChange={handleInputChange}
                        required
                      >
                        <option value="General">General</option>
                        <option value="Exam">Exam</option>
                        <option value="Event">Event</option>
                        <option value="Holiday">Holiday</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">⚠️</span>
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        className="form-input"
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Normal">Normal</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📚</span>
                      Target Audience
                    </label>
                    <select
                      name="courseId"
                      value={formData.courseId}
                      className="form-input"
                      onChange={handleInputChange}
                    >
                      <option value="">All Students</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.courseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📝</span>
                      Announcement Content
                    </label>
                    <textarea
                      name="content"
                      className="form-textarea"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Enter announcement details..."
                      rows="5"
                      style={{resize: 'none'}}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">📅</span>
                        Valid From (Optional)
                      </label>
                      <input 
                        type="date"
                        name="validFrom"
                        className="form-input"
                        value={formData.validFrom}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">📅</span>
                        Valid Until (Optional)
                      </label>
                      <input 
                        type="date"
                        name="validTo"
                        className="form-input"
                        value={formData.validTo}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📎</span>
                      Attachment (Optional)
                    </label>
                    <input 
                      type="file"
                      name="attachment"
                      className="form-input"
                      onChange={handleInputChange}
                      accept=".pdf,.doc,.docx,.jpg,.png"
                    />
                    <p className="form-hint">Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                      {isLoading ? "Posting..." : "Post Announcement"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Announcement Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Edit Announcement</h3>
                  <p className="modal-subtitle">Update announcement information</p>
                </div>
                <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                <form onSubmit={handleUpdateAnnouncement}>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input 
                      type="text" 
                      className="form-input"
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditInputChange}
                      required 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select
                        name="announcementType"
                        value={editFormData.announcementType}
                        className="form-input"
                        onChange={handleEditInputChange}
                      >
                        <option value="General">General</option>
                        <option value="Exam">Exam</option>
                        <option value="Event">Event</option>
                        <option value="Holiday">Holiday</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select
                        name="priority"
                        value={editFormData.priority}
                        className="form-input"
                        onChange={handleEditInputChange}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Audience</label>
                    <select
                      name="courseId"
                      value={editFormData.courseId}
                      className="form-input"
                      onChange={handleEditInputChange}
                    >
                      <option value="">All Students</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.courseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Content</label>
                    <textarea
                      name="content"
                      className="form-textarea"
                      value={editFormData.content}
                      onChange={handleEditInputChange}
                      rows="5"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Valid From</label>
                      <input 
                        type="date"
                        name="validFrom"
                        className="form-input"
                        value={editFormData.validFrom}
                        onChange={handleEditInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Valid Until</label>
                      <input 
                        type="date"
                        name="validTo"
                        className="form-input"
                        value={editFormData.validTo}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        value={editFormData.status}
                        className="form-input"
                        onChange={handleEditInputChange}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Announcement"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Announcement Modal */}
        {showViewModal && selectedAnnouncement && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Announcement Details</h3>
                  <p className="modal-subtitle">{selectedAnnouncement.title}</p>
                </div>
                <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                <div className="details-section">
                  <div className="info-row">
                    <label>Title:</label>
                    <span>{selectedAnnouncement.title}</span>
                  </div>
                  <div className="info-row">
                    <label>Type:</label>
                    <span className={`type-badge ${getTypeClass(selectedAnnouncement.announcementType)}`}>
                      {selectedAnnouncement.announcementType}
                    </span>
                  </div>
                  <div className="info-row">
                    <label>Priority:</label>
                    <span className={`priority-badge ${getPriorityClass(selectedAnnouncement.priority)}`}>
                      {selectedAnnouncement.priority}
                    </span>
                  </div>
                  <div className="info-row">
                    <label>Target:</label>
                    <span>{getCourseName(selectedAnnouncement.courseId)}</span>
                  </div>
                  <div className="info-row">
                    <label>Posted:</label>
                    <span>{new Date(selectedAnnouncement.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedAnnouncement.validFrom && (
                    <div className="info-row">
                      <label>Valid From:</label>
                      <span>{formatDate(selectedAnnouncement.validFrom)}</span>
                    </div>
                  )}
                  {selectedAnnouncement.validTo && (
                    <div className="info-row">
                      <label>Valid Until:</label>
                      <span>{formatDate(selectedAnnouncement.validTo)}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <label>Status:</label>
                    <span className={`status-badge status-${selectedAnnouncement.status?.toLowerCase()}`}>
                      {selectedAnnouncement.status}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <label>Content:</label>
                  <p className="announcement-full-content">{selectedAnnouncement.content}</p>
                </div>

                {selectedAnnouncement.attachment && (
                  <div className="detail-section">
                    <label>Attachment:</label>
                    <a href={selectedAnnouncement.attachment} target="_blank" rel="noopener noreferrer" className="attachment-link">
                      📎 Download Attachment
                    </a>
                  </div>
                )}

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setShowViewModal(false)}>
                    Close
                  </button>
                  <button 
                    className="btn-submit"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditClick(selectedAnnouncement);
                    }}
                  >
                    Edit Announcement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAnnouncements;