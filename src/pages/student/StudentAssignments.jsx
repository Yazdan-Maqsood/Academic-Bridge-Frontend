import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./studentAssignments.css";

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch student's assignments
  const handleGetAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/student/get-assignments`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setAssignments(response.data.assignments || []);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setErrorMsg("Failed to load assignments");
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

  // Submit assignment
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!selectedFile && !submissionText) {
      setErrorMsg("Please either upload a file or add submission text");
      return;
    }
    
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("assignmentId", selectedAssignment.id);
      formData.append("submissionText", submissionText);
      if (selectedFile) {
        formData.append("submissionFile", selectedFile);
      }
      
      const response = await axios.post(`${API_URL}/student/submit-assignment`, formData, {
        withCredentials: true,
      });
      
      if (response.status === 201) {
        setSuccessMsg("Assignment submitted successfully!");
        setShowSubmitModal(false);
        alert("Assignment submitted successfully!")
        resetSubmissionForm();
        handleGetAssignments(); // Refresh assignments
      }
    }
     catch (error) {
        console.error("Submit error:", error);
        setErrorMsg(error.response?.data?.message || "Failed to submit assignment");
    }
     finally {
      setIsLoading(false);
    }
  };

  // Open submit modal
  const handleOpenSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  // Open view modal
  const handleViewSubmission = (assignment) => {
    setSelectedAssignment(assignment);
    setShowViewModal(true);
  };

  // Reset submission form
  const resetSubmissionForm = () => {
    setSelectedFile(null);
    setSubmissionText("");
    setSelectedAssignment(null);
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("File size must be less than 10MB");
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip', 'application/x-zip-compressed'];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt|zip|rar)$/i)) {
        setErrorMsg("Please select a valid file (PDF, DOC, DOCX, TXT, ZIP, RAR)");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  // Get course name by ID
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id == courseId);
    return course ? course.courseName : "Unknown Course";
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'submitted': return 'status-submitted';
      case 'graded': return 'status-graded';
      case 'pending': return 'status-pending';
      case 'late': return 'status-late';
      default: return 'status-pending';
    }
  };

  // Check if due date is passed
  const isOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get remaining time
  const getRemainingTime = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now) return "Overdue";
    
    const diffTime = Math.abs(due - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "1 day remaining";
    return `${diffDays} days remaining`;
  };

  // Filter assignments
const filteredAssignments = (assignments || []).filter(assignment => {
    const matchesSearch = 
      assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCourseName(assignment.courseId)?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = !selectedCourse || assignment.courseId == selectedCourse;
    
    return matchesSearch && matchesCourse;
  });

  // Statistics
  const totalAssignments = filteredAssignments.length;
  const pendingCount = filteredAssignments.filter(a => a.status === 'Pending').length;
  const submittedCount = filteredAssignments.filter(a => a.status === 'Submitted').length;
  const gradedCount = filteredAssignments.filter(a => a.status === 'Graded').length;

  useEffect(() => {
    handleGetAssignments();
    handleGetCourses();
  }, []);

  return (
    <div className="student-assignments">
      <div className="assignments-container">
        
        {/* Header Banner */}
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">My Assignments 📝</h1>
              <p className="header-subtitle">View, submit, and track your assignment progress.</p>
            </div>
            <div className="header-stats">
              <div className="stat-chip">
                <span className="stat-icon">📋</span>
                <span className="stat-value">{totalAssignments}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-chip pending">
                <span className="stat-icon">⏳</span>
                <span className="stat-value">{pendingCount}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-chip submitted">
                <span className="stat-icon">✅</span>
                <span className="stat-value">{submittedCount}</span>
                <span className="stat-label">Submitted</span>
              </div>
              <div className="stat-chip graded">
                <span className="stat-icon">⭐</span>
                <span className="stat-value">{gradedCount}</span>
                <span className="stat-label">Graded</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="filter-section mb-4">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search assignments by title or course..." 
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
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.courseName}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading assignments...</p>
          </div>
        ) : (
          <div className="assignments-list">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className={`assignment-card ${isOverdue(assignment.dueDate) && assignment.status !== 'Submitted' ? 'overdue' : ''}`}>
                <div className="assignment-card-header">
                  <div className="assignment-icon">
                    {assignment.status === 'Graded' ? '✅' : assignment.status === 'Submitted' ? '📤' : '📝'}
                  </div>
                  <div className="assignment-info">
                    <h3 className="assignment-title">{assignment.title}</h3>
                    <p className="assignment-course">{getCourseName(assignment.courseId)}</p>
                  </div>
                  <div className="assignment-badge">
                    <span className={`status-badge ${getStatusClass(assignment.status)}`}>
                      {assignment.status || 'Pending'}
                    </span>
                  </div>
                </div>
                
                <div className="assignment-card-body">
                  {assignment.description && (
                    <p className="assignment-description">{assignment.description}</p>
                  )}
                  <div className="assignment-meta">
                    <div className="meta-item">
                      <span className="meta-icon">📅</span>
                      <span>Due: {formatDate(assignment.dueDate)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">⏰</span>
                      <span className={isOverdue(assignment.dueDate) && assignment.status !== 'Submitted' ? 'text-danger' : ''}>
                        {getRemainingTime(assignment.dueDate)}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">⭐</span>
                      <span>Total Marks: {assignment.totalMarks}</span>
                    </div>
                  </div>
                  
                  {assignment.status === 'Graded' && (
                    <div className="grade-section">
                      <div className="grade-card">
                        <div className="grade-score">
                          <span className="grade-label">Your Score:</span>
                          <span className="grade-value">{assignment.obtainedMarks || 0}</span>
                          <span className="grade-total">/{assignment.totalMarks}</span>
                        </div>
                        <div className="grade-percentage">
                          {assignment.obtainedMarks && ((assignment.obtainedMarks / assignment.totalMarks) * 100).toFixed(1)}%
                        </div>
                        {assignment.feedback && (
                          <div className="grade-feedback">
                            <span className="feedback-label">Feedback:</span>
                            <p>{assignment.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="assignment-card-footer">
                  {assignment.status === 'Graded' ? (
                    <button 
                      className="btn-view"
                      onClick={() => handleViewSubmission(assignment)}
                    >
                      View Feedback
                    </button>
                  ) : assignment.status === 'Submitted' ? (
                    <button 
                      className="btn-submitted"
                      disabled
                    >
                      ✓ Submitted - Awaiting Grading
                    </button>
                  ) : (
                    <button 
                      className="btn-submit"
                      onClick={() => handleOpenSubmitModal(assignment)}
                      disabled={isOverdue(assignment.dueDate)}
                    >
                      {isOverdue(assignment.dueDate) ? '🔒 Late Submission Closed' : '📤 Submit Assignment'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredAssignments.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-content">
                  <div className="empty-icon">📝</div>
                  <p className="empty-text">
                    {searchTerm || selectedCourse ? "No matching assignments found" : "No assignments yet"}
                  </p>
                  <p className="empty-subtext">
                    {searchTerm || selectedCourse 
                      ? "Try adjusting your filters" 
                      : "Check back later for new assignments"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Assignment Modal */}
        {showSubmitModal && selectedAssignment && (
          <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Submit Assignment</h3>
                  <p className="modal-subtitle">{selectedAssignment.title}</p>
                </div>
                <button className="modal-close" onClick={() => setShowSubmitModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                {successMsg && <div className="success-message">{successMsg}</div>}
                
                <div className="assignment-details">
                  <div className="detail-row">
                    <label>Course:</label>
                    <span>{getCourseName(selectedAssignment.courseId)}</span>
                  </div>
                  <div className="detail-row">
                    <label>Due Date:</label>
                    <span>{formatDate(selectedAssignment.dueDate)}</span>
                  </div>
                  <div className="detail-row">
                    <label>Total Marks:</label>
                    <span>{selectedAssignment.totalMarks}</span>
                  </div>
                  {selectedAssignment.description && (
                    <div className="detail-row">
                      <label>Description:</label>
                      <p>{selectedAssignment.description}</p>
                    </div>
                  )}
                  {selectedAssignment.instructions && (
                    <div className="detail-row">
                      <label>Instructions:</label>
                      <p>{selectedAssignment.instructions}</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmitAssignment}>
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📝</span>
                      Submission Text
                    </label>
                    <textarea
                    
                      name="submissionText"
                      className="form-textarea"
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Enter any comments or text submission here..."
                      rows="4"
                      style={{resize: "none"}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📎</span>
                      Upload File
                    </label>
                    <input
                      type="file"
                      className="form-input"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    {selectedFile && (
                      <p className="file-info">Selected: {selectedFile.name}</p>
                    )}
                    <p className="form-hint">Max file size: 10MB. Supported: PDF, DOC, DOCX, TXT</p>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowSubmitModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                      {isLoading ? "Submitting..." : "Submit Assignment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Submission Modal */}
        {showViewModal && selectedAssignment && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Assignment Feedback</h3>
                  <p className="modal-subtitle">{selectedAssignment.title}</p>
                </div>
                <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                <div className="result-section">
                  <div className="result-card">
                    <div className="result-score">
                      <div className="score-circle">
                        <span className="score-value">
                          {selectedAssignment.obtainedMarks || 0}
                        </span>
                        <span className="score-total">/{selectedAssignment.totalMarks}</span>
                      </div>
                      <div className="score-percentage">
                        {selectedAssignment.obtainedMarks && 
                          ((selectedAssignment.obtainedMarks / selectedAssignment.totalMarks) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="result-status">
                      <span className={`status-badge ${getStatusClass(selectedAssignment.status)}`}>
                        {selectedAssignment.status}
                      </span>
                    </div>
                  </div>
                  
                  {selectedAssignment.feedback && (
                    <div className="feedback-section">
                      <h4 className="section-title-small">Feedback from Instructor</h4>
                      <div className="feedback-content">
                        <p>{selectedAssignment.feedback}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedAssignment.gradedAt && (
                    <div className="graded-info">
                      <span className="info-icon">📅</span>
                      <span>Graded on: {formatDate(selectedAssignment.gradedAt)}</span>
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setShowViewModal(false)}>
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

export default StudentAssignments;