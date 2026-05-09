import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./studentAnnouncements.css";

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch announcements
  const handleGetAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/student/get-announcements`, {
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

  // Fetch student's courses for filter
  const handleGetCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/get-courses`, {
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

  // Mark announcement as read
  const handleMarkAsRead = async (announcementId) => {
    try {
      await axios.post(`${API_URL}/student/mark-announcement-read/${announcementId}`, {}, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      // Update local state
      setAnnouncements(announcements.map(ann => 
        ann.id === announcementId ? { ...ann, isRead: true } : ann
      ));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // View announcement details
  const handleViewDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetailModal(true);
    if (!announcement.isRead) {
      handleMarkAsRead(announcement.id);
    }
  };

  // Get course name
  const getCourseName = (courseId) => {
    if (!courseId) return "All Students";
    const course = courses.find(c => c.id == courseId);
    return course ? course.courseName : "All Students";
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

  // Get type badge class
  const getTypeClass = (type) => {
    switch(type?.toLowerCase()) {
      case 'exam': return 'type-exam';
      case 'event': return 'type-event';
      case 'holiday': return 'type-holiday';
      default: return 'type-general';
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'exam': return '📝';
      case 'event': return '🎉';
      case 'holiday': return '🏖️';
      default: return '📢';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get relative time
  const getRelativeTime = (dateString) => {
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

  // Filter announcements
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = !selectedCourse || announcement.courseId == selectedCourse;
    const matchesType = selectedType === 'all' || announcement.announcementType?.toLowerCase() === selectedType;
    const matchesPriority = selectedPriority === 'all' || announcement.priority?.toLowerCase() === selectedPriority;
    
    return matchesSearch && matchesCourse && matchesType && matchesPriority;
  });

  // Sort announcements (unread first, then by date)
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Statistics
  const totalAnnouncements = announcements.length;
  const unreadCount = announcements.filter(a => !a.isRead).length;
  const highPriorityCount = announcements.filter(a => a.priority === 'High').length;

  useEffect(() => {
    handleGetAnnouncements();
    handleGetCourses();
  }, []);

  return (
    <div className="student-announcements">
      <div className="announcements-container">
        
        {/* Header Banner */}
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">Announcements 📢</h1>
              <p className="header-subtitle">Stay updated with the latest news and updates.</p>
            </div>
            <div className="header-stats">
              <div className="stat-chip">
                <span className="stat-icon">📢</span>
                <span className="stat-value">{totalAnnouncements}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-chip unread">
                <span className="stat-icon">🔔</span>
                <span className="stat-value">{unreadCount}</span>
                <span className="stat-label">Unread</span>
              </div>
              <div className="stat-chip high">
                <span className="stat-icon">⚠️</span>
                <span className="stat-value">{highPriorityCount}</span>
                <span className="stat-label">High Priority</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section mb-4">
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
          <select
            className="filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="exam">Exam</option>
            <option value="event">Event</option>
            <option value="holiday">Holiday</option>
            <option value="general">General</option>
          </select>
          <select
            className="filter-select"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="normal">Normal</option>
          </select>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading announcements...</p>
          </div>
        ) : (
          <div className="announcements-list">
            {sortedAnnouncements.map((announcement) => (
              <div 
                key={announcement.id} 
                className={`announcement-card ${!announcement.isRead ? 'unread' : ''} priority-${announcement.priority?.toLowerCase()}`}
                onClick={() => handleViewDetails(announcement)}
              >
                <div className="announcement-card-header">
                  <div className="announcement-icon">
                    {getTypeIcon(announcement.announcementType)}
                  </div>
                  <div className="announcement-info">
                    <h3 className="announcement-title">
                      {!announcement.isRead && <span className="unread-dot"></span>}
                      {announcement.title}
                    </h3>
                    <div className="announcement-meta">
                      <span className={`type-badge ${getTypeClass(announcement.announcementType)}`}>
                        {announcement.announcementType || 'General'}
                      </span>
                      <span className={`priority-badge ${getPriorityClass(announcement.priority)}`}>
                        {announcement.priority || 'Normal'}
                      </span>
                      <span className="target-badge">
                        🎯 {getCourseName(announcement.courseId)}
                      </span>
                    </div>
                  </div>
                  <div className="announcement-date">
                    <span className="date">{getRelativeTime(announcement.createdAt)}</span>
                  </div>
                </div>
                
                <div className="announcement-card-body">
                  <p className="announcement-preview">
                    {announcement.content.length > 150 
                      ? announcement.content.substring(0, 150) + "..." 
                      : announcement.content}
                  </p>
                </div>
                
                <div className="announcement-card-footer">
                  <button className="btn-read-more">
                    Read More →
                  </button>
                </div>
              </div>
            ))}

            {sortedAnnouncements.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-content">
                  <div className="empty-icon">📢</div>
                  <p className="empty-text">
                    {searchTerm || selectedCourse !== "" || selectedType !== "all" || selectedPriority !== "all"
                      ? "No matching announcements found" 
                      : "No announcements yet"}
                  </p>
                  <p className="empty-subtext">
                    {searchTerm || selectedCourse !== "" || selectedType !== "all" || selectedPriority !== "all"
                      ? "Try adjusting your filters" 
                      : "Check back later for important updates."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Announcement Detail Modal */}
        {showDetailModal && selectedAnnouncement && (
          <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">{selectedAnnouncement.title}</h3>
                  <p className="modal-subtitle">
                    {getTypeIcon(selectedAnnouncement.announcementType)} {selectedAnnouncement.announcementType || 'General'} • 
                    {selectedAnnouncement.priority && ` ${selectedAnnouncement.priority} Priority`}
                  </p>
                </div>
                <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                <div className="detail-section">
                  <div className="detail-meta">
                    <div className="meta-row">
                      <span className="meta-label">📅 Posted:</span>
                      <span className="meta-value">{formatDate(selectedAnnouncement.createdAt)}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">🎯 Target:</span>
                      <span className="meta-value">{getCourseName(selectedAnnouncement.courseId)}</span>
                    </div>
                    {selectedAnnouncement.validFrom && (
                      <div className="meta-row">
                        <span className="meta-label">📅 Valid From:</span>
                        <span className="meta-value">{formatDate(selectedAnnouncement.validFrom)}</span>
                      </div>
                    )}
                    {selectedAnnouncement.validTo && (
                      <div className="meta-row">
                        <span className="meta-label">📅 Valid Until:</span>
                        <span className="meta-value">{formatDate(selectedAnnouncement.validTo)}</span>
                      </div>
                    )}
                    <div className="meta-row">
                      <span className="meta-label">🏷️ Type:</span>
                      <span className={`type-badge ${getTypeClass(selectedAnnouncement.announcementType)}`}>
                        {selectedAnnouncement.announcementType || 'General'}
                      </span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">⚠️ Priority:</span>
                      <span className={`priority-badge ${getPriorityClass(selectedAnnouncement.priority)}`}>
                        {selectedAnnouncement.priority || 'Normal'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-content">
                  <label>Message:</label>
                  <div className="announcement-content-full">
                    <p>{selectedAnnouncement.content}</p>
                  </div>
                </div>

                {selectedAnnouncement.attachment && (
                  <div className="detail-attachment">
                    <label>Attachment:</label>
                    <a 
                      href={`${API_URL}${selectedAnnouncement.attachment}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="attachment-link"
                    >
                      📎 Download Attachment
                    </a>
                  </div>
                )}

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>
                    Close
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

export default StudentAnnouncements;