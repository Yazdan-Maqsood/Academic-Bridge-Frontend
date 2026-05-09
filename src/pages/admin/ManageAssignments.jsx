import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./manageAssignments.css";

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    dueDate: "",
    totalMarks: "",
    instructions: ""
  });
  
  const [editFormData, setEditFormData] = useState({
    id: "",
    title: "",
    description: "",
    courseId: "",
    dueDate: "",
    totalMarks: "",
    instructions: "",
    status: "Active"
  });

  // Fetch all assignments
  const handleGetAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/admin/get-assignments`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setAssignments(response.data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setErrorMsg("Failed to load assignments");
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

  // Add new assignment
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/admin/add-assignment`, formData, {
        withCredentials: true
      });
      
      if (response.status === 201) {
        setAssignments([...assignments, response.data.assignment]);
        setShowModal(false);
        resetForm();
        alert("Assignment added successfully!");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setErrorMsg("Assignment already exists");
      } else {
        setErrorMsg(error.response?.data?.message || "Failed to add assignment");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update assignment
  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/admin/update-assignment/${editFormData.id}`, editFormData, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        setAssignments(assignments.map(assignment => 
          assignment.id === editFormData.id ? response.data.assignment : assignment
        ));
        setShowEditModal(false);
        resetEditForm();
        alert("Assignment updated successfully!");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to update assignment");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (assignmentId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.delete(`${API_URL}/admin/delete-assignment/${assignmentId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
        alert("Assignment deleted successfully!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "Failed to delete assignment");
    } finally {
      setIsLoading(false);
    }
  };

  // View assignment details
  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setShowViewModal(true);
  };

  // Open edit modal with assignment data
  const handleEditClick = (assignment) => {
    setEditFormData({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description || "",
      courseId: assignment.courseId,
      dueDate: assignment.dueDate?.split('T')[0] || assignment.dueDate,
      totalMarks: assignment.totalMarks,
      instructions: assignment.instructions || "",
      status: assignment.status
    });
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      courseId: "",
      dueDate: "",
      totalMarks: "",
      instructions: ""
    });
  };

  const resetEditForm = () => {
    setEditFormData({
      id: "",
      title: "",
      description: "",
      courseId: "",
      dueDate: "",
      totalMarks: "",
      instructions: "",
      status: ""
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Get course name by ID
 const getCourseName = (courseId) => {
  const course = courses.find(c => c.id == courseId); // use == for safety
  return course ? course.courseName : "Unknown Course";
};

  // Filter assignments based on search
  const filteredAssignments = assignments.filter(assignment =>
    assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCourseName(assignment.courseId)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if due date is approaching (within 3 days)
  const isDueSoon = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  // Check if due date is overdue
  const isOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    handleGetAssignments();
    handleGetCourses();
  }, []);

  return (
    <div className="manage-assignments">
      <div className="assignments-container">
        
        {/* Header Banner */}
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">Manage Assignments 📝</h1>
              <p className="header-subtitle">Create, edit, and manage all course assignments in the portal.</p>
            </div>
            <button 
              className="btn-add-assignment"
              onClick={() => setShowModal(true)}
            >
              <span className="btn-icon">➕</span>
              Add New Assignment
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid mb-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <p className="stat-label">Total Assignments</p>
              <h3 className="stat-value">{assignments.length}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <p className="stat-label">Active</p>
              <h3 className="stat-value">{assignments.filter(a => a.status === 'Active').length}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <p className="stat-label">Due Soon</p>
              <h3 className="stat-value">{assignments.filter(a => isDueSoon(a.dueDate) && a.status === 'Active').length}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <p className="stat-label">Total Courses</p>
              <h3 className="stat-value">{courses.length}</h3>
            </div>
          </div>
        </div>

        {/* Assignments Table Card */}
        <div className="assignments-card">
          <div className="card-header-custom">
            <div>
              <h3 className="card-title">Assignment Records</h3>
              <p className="card-subtitle">Showing {filteredAssignments.length} of {assignments.length} assignments</p>
            </div>
            <div className="header-actions">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search assignments by title, course or status..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading assignments...</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th className="col-title">Title</th>
                    <th className="col-course">Course</th>
                    <th className="col-due">Due Date</th>
                    <th className="col-marks">Total Marks</th>
                    <th className="col-submissions">Submissions</th>
                    <th className="col-status">Status</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className={
                      isOverdue(assignment.dueDate) ? "overdue-row" : 
                      isDueSoon(assignment.dueDate) ? "due-soon-row" : ""
                    }>
                      <td className="assignment-title">
                        <div className="title-info">
                          <div className="title-icon">📄</div>
                          <span>{assignment.title}</span>
                        </div>
                      </td>
                      <td className="course-name">{getCourseName(assignment.courseId)}</td>
                      <td className="due-date">
                        <span className={`due-badge ${isOverdue(assignment.dueDate) ? 'overdue' : isDueSoon(assignment.dueDate) ? 'due-soon' : 'upcoming'}`}>
                          📅 {formatDate(assignment.dueDate)}
                          {isOverdue(assignment.dueDate) && <span className="badge-text"> (Overdue)</span>}
                          {isDueSoon(assignment.dueDate) && !isOverdue(assignment.dueDate) && <span className="badge-text"> (Soon)</span>}
                        </span>
                      </td>
                      <td className="total-marks">
                        <span className="marks-badge">{assignment.totalMarks} pts</span>
                      </td>
                      <td className="submissions">
                        <button 
                          className="submissions-btn"
                          onClick={() => handleViewAssignment(assignment)}
                        >
                          📊 View Submissions
                        </button>
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge status-${assignment.status?.toLowerCase()}`}>
                          {assignment.status || 'Active'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="action-badge action-badge-view" 
                          title="View Details"
                          onClick={() => handleViewAssignment(assignment)}
                        >
                           View
                        </button>
                        <button 
                          className="action-badge action-badge-edit" 
                          title="Edit Assignment"
                          onClick={() => handleEditClick(assignment)}
                        >
                           Edit
                        </button>
                        <button 
                          className="action-badge action-badge-delete" 
                          title="Delete Assignment"
                          onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                        >
                           Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAssignments.length === 0 && (
                    <tr className="empty-state">
                      <td colSpan="7">
                        <div className="empty-state-content">
                          <div className="empty-icon">📝</div>
                          <p className="empty-text">
                            {searchTerm ? "No matching assignments found" : "No assignments found"}
                          </p>
                          <p className="empty-subtext">
                            {searchTerm 
                              ? `No assignments match "${searchTerm}"` 
                              : 'Click the "Add New Assignment" button to get started.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Assignment Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Add New Assignment</h3>
                  <p className="modal-subtitle">Create a new assignment for a course</p>
                </div>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                <form onSubmit={handleAddAssignment}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">📌</span>
                        Assignment Title
                      </label>
                      <input 
                        type="text" 
                        className="form-input"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Database Design Project" 
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">📚</span>
                        Select Course
                      </label>
                      <select
                        name="courseId"
                        value={formData.courseId}
                        className="form-input"
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.courseCode} - {course.courseName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">📅</span>
                        Due Date
                      </label>
                      <input 
                        type="date"
                        name="dueDate"
                        className="form-input"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">⭐</span>
                        Total Marks
                      </label>
                      <input 
                        type="number"
                        name="totalMarks"
                        className="form-input"
                        value={formData.totalMarks}
                        onChange={handleInputChange}
                        placeholder="e.g., 100"
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📝</span>
                      Description
                    </label>
                    <textarea
                      name="description"
                      className="form-textarea"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter assignment description..."
                      style={{resize: "none"}}
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📋</span>
                      Instructions
                    </label>
                    <textarea
                      name="instructions"
                      className="form-textarea"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      placeholder="Enter submission instructions, formatting requirements, etc..."
                      style={{resize: "none"}}
                      rows="3"
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Assignment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Assignment Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Edit Assignment</h3>
                  <p className="modal-subtitle">Update assignment information</p>
                </div>
                <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                <form onSubmit={handleUpdateAssignment}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Assignment Title</label>
                      <input 
                        type="text" 
                        className="form-input"
                        name="title"
                        value={editFormData.title}
                        onChange={handleEditInputChange}
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Course</label>
                      <select
                        name="courseId"
                        value={editFormData.courseId}
                        className="form-input"
                        onChange={handleEditInputChange}
                        required
                      >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.courseCode} - {course.courseName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Due Date</label>
                      <input 
                        type="date"
                        name="dueDate"
                        className="form-input"
                        value={editFormData.dueDate}
                        onChange={handleEditInputChange}
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Total Marks</label>
                      <input 
                        type="number"
                        name="totalMarks"
                        className="form-input"
                        value={editFormData.totalMarks}
                        onChange={handleEditInputChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-textarea"
                      value={editFormData.description}
                      style={{resize: "none"}}
                      onChange={handleEditInputChange}
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Instructions</label>
                    <textarea
                      name="instructions"
                      className="form-textarea"
                      style={{resize: "none"}}
                      value={editFormData.instructions}
                      onChange={handleEditInputChange}
                      rows="3"
                    />
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
                      {isLoading ? "Updating..." : "Update Assignment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Assignment Modal */}
        {showViewModal && selectedAssignment && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Assignment Details</h3>
                  <p className="modal-subtitle">{selectedAssignment.title}</p>
                </div>
                <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Course</label>
                    <p>{getCourseName(selectedAssignment.courseId)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Due Date</label>
                    <p className={isOverdue(selectedAssignment.dueDate) ? 'text-danger' : ''}>
                      {formatDate(selectedAssignment.dueDate)}
                      {isOverdue(selectedAssignment.dueDate) && " (Overdue)"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Total Marks</label>
                    <p>{selectedAssignment.totalMarks} points</p>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <p>
                      <span className={`status-badge status-${selectedAssignment.status?.toLowerCase()}`}>
                        {selectedAssignment.status}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedAssignment.description && (
                  <div className="detail-section">
                    <label>Description</label>
                    <p>{selectedAssignment.description}</p>
                  </div>
                )}

                {selectedAssignment.instructions && (
                  <div className="detail-section">
                    <label>Instructions</label>
                    <p>{selectedAssignment.instructions}</p>
                  </div>
                )}

                <div className="detail-section">
                  <label>Submissions</label>
                  <div className="submissions-placeholder">
                    <p className="text-muted">📊 Submission tracking will be displayed here</p>
                    <p className="text-muted small">Total Submissions: 0 | Pending Grading: 0 | Graded: 0</p>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className="btn-cancel" 
                    onClick={() => setShowViewModal(false)}
                  >
                    Close
                  </button>
                  <button 
                    className="btn-submit"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditClick(selectedAssignment);
                    }}
                  >
                    Edit Assignment
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

export default ManageAssignments;