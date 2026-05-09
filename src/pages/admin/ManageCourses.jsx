import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./manageCourses.css";

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editSelectedFile, setEditSelectedFile] = useState(null);
  
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    credits: "",
    instructor: "",
    department: "",
    description: "",
    status: "Active"
  });
  
  const [editFormData, setEditFormData] = useState({
    id: "",
    courseCode: "",
    courseName: "",
    credits: "",
    instructor: "",
    department: "",
    description: "",
    status: "",
    courseFile: ""
  });

  // Fetch all courses
  const handleGetCourses = async () => {
    try {
      setIsLoading(true);
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
      setErrorMsg("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  // Add new course with file - FIXED
  const handleAddCourse = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("courseCode", formData.courseCode);
      formDataToSend.append("courseName", formData.courseName);
      formDataToSend.append("credits", formData.credits);
      formDataToSend.append("instructor", formData.instructor);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("status", formData.status);
      
      // Only append file if selected (file is optional)
      if (selectedFile) {
        formDataToSend.append("courseFile", selectedFile);
      }
      
      const response = await axios.post(`${API_URL}/admin/add-course`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true
      });
      
      if (response.status === 201) {
        setCourses([...courses, response.data.course]);
        setShowModal(false);
        resetForm();
        alert("Course added successfully!");
      }
    } catch (error) {
      console.error("Add course error:", error);
      if (error.response?.status === 409) {
        setErrorMsg("Course already exists");
      } else {
        setErrorMsg(error.response?.data?.message || "Failed to add course");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update course with file - FIXED
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("courseCode", editFormData.courseCode);
      formDataToSend.append("courseName", editFormData.courseName);
      formDataToSend.append("credits", editFormData.credits);
      formDataToSend.append("instructor", editFormData.instructor);
      formDataToSend.append("department", editFormData.department);
      formDataToSend.append("description", editFormData.description || "");
      formDataToSend.append("status", editFormData.status);
      
      // Only append file if selected
      if (editSelectedFile) {
        formDataToSend.append("courseFile", editSelectedFile);
      }
      
      const response = await axios.put(`${API_URL}/admin/update-course/${editFormData.id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true
      });
      
      if (response.status === 200) {
        setCourses(courses.map(course => 
          course.id === editFormData.id ? response.data.course : course
        ));
        setShowEditModal(false);
        resetEditForm();
        alert("Course updated successfully!");
      }
    } catch (error) {
      console.error("Update course error:", error);
      setErrorMsg(error.response?.data?.message || "Failed to update course");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId, courseName) => {
    if (!window.confirm(`Are you sure you want to delete "${courseName}"? This will also delete the course file.`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.delete(`${API_URL}/admin/delete-course/${courseId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setCourses(courses.filter(course => course.id !== courseId));
        alert("Course deleted successfully!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "Failed to delete course");
    } finally {
      setIsLoading(false);
    }
  };

  // Download course file
  const handleDownloadFile = async (courseId, fileName) => {
    try {
      const response = await axios.get(`${API_URL}/admin/download-course-file/${courseId}`, {
        responseType: 'blob',
        withCredentials: true,
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file");
    }
  };

  // Open edit modal with course data
  const handleEditClick = (course) => {
    setEditFormData({
      id: course.id,
      courseCode: course.courseCode,
      courseName: course.courseName,
      credits: course.credits,
      instructor: course.instructor,
      department: course.department,
      description: course.description || "",
      status: course.status,
      courseFile: course.courseFile || ""
    });
    setEditSelectedFile(null);
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      courseCode: "",
      courseName: "",
      credits: "",
      instructor: "",
      department: "",
      description: "",
      status: "Active"
    });
    setSelectedFile(null);
  };

  const resetEditForm = () => {
    setEditFormData({
      id: "",
      courseCode: "",
      courseName: "",
      credits: "",
      instructor: "",
      department: "",
      description: "",
      status: "",
      courseFile: ""
    });
    setEditSelectedFile(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("File size must be less than 10MB");
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg("Please select a valid file (PDF, DOC, DOCX, TXT)");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("File size must be less than 10MB");
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg("Please select a valid file (PDF, DOC, DOCX, TXT)");
        return;
      }
      
      setEditSelectedFile(file);
    }
  };

  // Get file icon based on file extension
  const getFileIcon = (fileName) => {
    if (!fileName) return "📄";
    const ext = fileName.split('.').pop().toLowerCase();
    switch(ext) {
      case 'pdf': return "📕";
      case 'doc':
      case 'docx': return "📘";
      default: return "📄";
    }
  };

  // Get file name from path
  const getFileName = (filePath) => {
    if (!filePath) return "";
    return filePath.split('/').pop();
  };

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    handleGetCourses();
  }, []);

  return (
    <div className="manage-courses">
      <div className="courses-container">
        
        {/* Header Banner */}
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">Manage Courses 📚</h1>
              <p className="header-subtitle">Create, edit, and manage all academic courses in the portal.</p>
            </div>
            <button 
              className="btn-add-course"
              onClick={() => setShowModal(true)}
            >
              <span className="btn-icon">➕</span>
              Add New Course
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid mb-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">📖</div>
            <div className="stat-info">
              <p className="stat-label">Total Courses</p>
              <h3 className="stat-value">{courses.length}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-info">
              <p className="stat-label">Active Courses</p>
              <h3 className="stat-value">{courses.filter(c => c.status === 'Active').length}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <p className="stat-label">Total Credits</p>
              <h3 className="stat-value">
                {courses.reduce((sum, c) => sum + (parseInt(c.credits) || 0), 0)}
              </h3>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <p className="stat-label">Departments</p>
              <h3 className="stat-value">
                {new Set(courses.map(c => c.department)).size}
              </h3>
            </div>
          </div>
        </div>

        {/* Courses Table Card */}
        <div className="courses-card">
          <div className="card-header-custom">
            <div>
              <h3 className="card-title">Course Records</h3>
              <p className="card-subtitle">Showing {filteredCourses.length} of {courses.length} courses</p>
            </div>
            <div className="header-actions">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search courses..." 
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
              <p>Loading courses...</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="courses-table">
                <thead>
                  <tr>
                    <th className="col-code">Course Code</th>
                    <th className="col-name">Course Name</th>
                    <th className="col-credits">Credits</th>
                    <th className="col-instructor">Instructor</th>
                    <th className="col-department">Department</th>
                    <th className="col-file">Course File</th>
                    <th className="col-status">Status</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.id}>
                      <td className="course-code">
                        <span className="code-badge">{course.courseCode}</span>
                      </td>
                      <td className="course-name">
                        <div className="course-info">
                          <div className="course-icon">📘</div>
                          <span>{course.courseName}</span>
                        </div>
                      </td>
                      <td className="credits">
                        <span className="credits-badge">{course.credits} CR</span>
                      </td>
                      <td className="instructor">{course.instructor}</td>
                      <td className="department">{course.department}</td>
                      <td className="course-file">
                        {course.courseFile ? (
                          <button 
                            className="file-download-btn"
                            onClick={() => handleDownloadFile(course.id, getFileName(course.courseFile))}
                            title="Download course material"
                          >
                            <span className="file-icon">{getFileIcon(course.courseFile)}</span>
                            <span className="download-icon">⬇️</span>
                          </button>
                        ) : (
                          <span className="no-file">No file</span>
                        )}
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge status-${course.status?.toLowerCase()}`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="action-badge action-badge-edit" 
                          title="Edit Course"
                          onClick={() => handleEditClick(course)}
                        >
                           Edit
                        </button>
                        <button 
                          className="action-badge action-badge-delete" 
                          title="Delete Course"
                          onClick={() => handleDeleteCourse(course.id, course.courseName)}
                        >
                           Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCourses.length === 0 && (
                    <tr className="empty-state">
                      <td colSpan="8">
                        <div className="empty-state-content">
                          <div className="empty-icon">📚</div>
                          <p className="empty-text">No courses found</p>
                          <p className="empty-subtext">
                            {searchTerm ? "Try a different search term" : "Click the 'Add New Course' button to get started."}
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

        {/* Add Course Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Add New Course</h3>
                  <p className="modal-subtitle">Create a new course in the system</p>
                </div>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                <form onSubmit={handleAddCourse}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">🔢</span>
                        Course Code
                      </label>
                      <input 
                        type="text" 
                        className="form-input"
                        name="courseCode"
                        value={formData.courseCode}
                        onChange={handleInputChange}
                        placeholder="e.g., CS301" 
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">📖</span>
                        Course Name
                      </label>
                      <input 
                        type="text"
                        name="courseName"
                        className="form-input"
                        value={formData.courseName}
                        onChange={handleInputChange}
                        placeholder="e.g., Database Systems"
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">⚡</span>
                        Credits
                      </label>
                      <input 
                        type="number"
                        name="credits"
                        className="form-input"
                        value={formData.credits}
                        onChange={handleInputChange}
                        placeholder="e.g., 3"
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">👨‍🏫</span>
                        Instructor
                      </label>
                      <input 
                        type="text"
                        name="instructor"
                        className="form-input"
                        value={formData.instructor}
                        onChange={handleInputChange}
                        placeholder="e.g., Dr. Ahmed"
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">🏛️</span>
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      className="form-input"
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Medical">Medical</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Business Administration">Business Administration</option>
                      <option value="English">English</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📝</span>
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      className="form-textarea"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter course description..."
                      rows="3"
                      style={{resize: 'none'}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📎</span>
                      Course Material (PDF, DOC, DOCX) - Optional
                    </label>
                    <input
                      type='file'
                      name="courseFile"
                      className="form-input"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    {selectedFile && (
                      <p className="file-info">Selected: {selectedFile.name}</p>
                    )}
                    <p className="form-hint">Max file size: 10MB. Supported formats: PDF, DOC, DOCX, TXT (Optional)</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">⚙️</span>
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      className="form-input"
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Course"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Course Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Edit Course</h3>
                  <p className="modal-subtitle">Update course information</p>
                </div>
                <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                <form onSubmit={handleUpdateCourse}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Course Code</label>
                      <input 
                        type="text" 
                        className="form-input"
                        name="courseCode"
                        value={editFormData.courseCode}
                        onChange={handleEditInputChange}
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Course Name</label>
                      <input 
                        type="text"
                        name="courseName"
                        className="form-input"
                        value={editFormData.courseName}
                        onChange={handleEditInputChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Credits</label>
                      <input 
                        type="number"
                        name="credits"
                        className="form-input"
                        value={editFormData.credits}
                        onChange={handleEditInputChange}
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Instructor</label>
                      <input 
                        type="text"
                        name="instructor"
                        className="form-input"
                        value={editFormData.instructor}
                        onChange={handleEditInputChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      name="department"
                      value={editFormData.department}
                      className="form-input"
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Medical">Medical</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Business Administration">Business Administration</option>
                      <option value="English">English</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-textarea"
                      value={editFormData.description}
                      onChange={handleEditInputChange}
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📎</span>
                      Update Course Material (Optional)
                    </label>
                    {editFormData.courseFile && (
                      <div className="current-file">
                        <span>Current file: </span>
                        <a href="#" onClick={(e) => {
                          e.preventDefault();
                          handleDownloadFile(editFormData.id, getFileName(editFormData.courseFile));
                        }}>
                          {getFileIcon(editFormData.courseFile)} {getFileName(editFormData.courseFile)}
                        </a>
                      </div>
                    )}
                    <input
                      type='file'
                      name="courseFile"
                      className="form-input"
                      onChange={handleEditFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    {editSelectedFile && (
                      <p className="file-info">New file selected: {editSelectedFile.name}</p>
                    )}
                    <p className="form-hint">Leave empty to keep current file. Max size: 10MB</p>
                  </div>

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

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Course"}
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

export default ManageCourses;