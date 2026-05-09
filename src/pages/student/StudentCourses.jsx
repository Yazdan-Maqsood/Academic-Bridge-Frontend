import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./studentCourses.css";

const StudentCourses = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollingCourse, setEnrollingCourse] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch all available courses
  const handleGetAllCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/student/get-all-courses`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setAllCourses(response.data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setErrorMsg("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch student's enrolled courses
  const handleGetEnrolledCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/get-courses`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setEnrolledCourses(response.data.courses);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  // Enroll in a course
  const handleEnrollCourse = async () => {
    if (!enrollingCourse) return;
    
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/student/enroll-course`, {
        courseId: enrollingCourse.id, 
      }, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setSuccessMsg(`Successfully enrolled in ${enrollingCourse.courseName}!`);
        setShowEnrollModal(false);
        await handleGetAllCourses();
        await handleGetEnrolledCourses();
        setEnrollingCourse(null);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to enroll in course");
    } finally {
      setIsLoading(false);
    }
  };

  // Download course material
  const handleDownloadMaterial = async (courseId, fileName) => {
    try {
      const response = await axios.get(`${API_URL}/student/download-course-material/${courseId}`, {
        responseType: 'blob',
        withCredentials: true,
      });
      
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
      alert("Failed to download material");
    }
  };

  // View course materials
  const handleViewMaterials = (course) => {
    setSelectedCourse(course);
    setShowMaterialModal(true);
  };

  // Open enroll modal
  const handleOpenEnrollModal = (course) => {
    setEnrollingCourse(course);
    setShowEnrollModal(true);
  };

  // Check if course is already enrolled
  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course.id === courseId);
  };

  // Get unique departments for filter
  const departments = [...new Set(allCourses.map(course => course.department))];

  // Get file icon
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

  // Filter courses
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = 
      course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || course.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  useEffect(() => {
    handleGetAllCourses();
    handleGetEnrolledCourses();
  }, []);

  return (
    <div className="all-courses">
      <div className="courses-container">
        
        {/* Header Banner */}
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">All Available Courses 📚</h1>
              <p className="header-subtitle">Browse and enroll in courses that interest you.</p>
            </div>
            <div className="header-stats">
              <div className="stat-chip">
                <span className="stat-icon">📖</span>
                <span className="stat-value">{allCourses.length}</span>
                <span className="stat-label">Available</span>
              </div>
              <div className="stat-chip enrolled">
                <span className="stat-icon">✅</span>
                <span className="stat-value">{enrolledCourses.length}</span>
                <span className="stat-label">Enrolled</span>
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
              placeholder="Search by course name, code or instructor..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <div key={course.id} className={`course-card ${isEnrolled(course.id) ? 'enrolled' : ''}`}>
                <div className="course-card-header">
                  <div className="course-icon-large">
                    {getFileIcon(course.courseFile)}
                  </div>
                  <div className="course-badge">
                    {isEnrolled(course.id) ? (
                      <span className="badge-enrolled">Enrolled</span>
                    ) : (
                      <span className="badge-available">Available</span>
                    )}
                  </div>
                </div>
                
                <div className="course-card-body">
                  <h3 className="course-title">{course.courseName}</h3>
                  <p className="course-code">{course.courseCode}</p>
                  <p className="course-instructor">
                    <span className="label">Instructor:</span> {course.instructor}
                  </p>
                  <p className="course-credits">
                    <span className="label">Credits:</span> {course.credits}
                  </p>
                  <p className="course-department">
                    <span className="label">Department:</span> {course.department}
                  </p>
                  {course.description && (
                    <p className="course-description">
                      {course.description.length > 100 
                        ? course.description.substring(0, 100) + "..." 
                        : course.description}
                    </p>
                  )}
                </div>
                
                <div className="course-card-footer">
                  {course.courseFile ? (
                    <button 
                      className="btn-material"
                      onClick={() => handleViewMaterials(course)}
                    >
                      📄 View Material
                    </button>
                  ) : (
                    <button 
                      className="btn-material-disabled"
                      disabled
                    >
                      No Material
                    </button>
                  )}
                  
                  {isEnrolled(course.id) ? (
                    <button className="btn-enrolled" disabled>
                      ✓ Enrolled
                    </button>
                  ) : (
                    <button 
                      className="btn-enroll"
                      onClick={() => handleOpenEnrollModal(course)}
                    >
                      + Enroll Now
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredCourses.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-content">
                  <div className="empty-icon">📚</div>
                  <p className="empty-text">
                    {searchTerm || selectedDepartment ? "No matching courses found" : "No courses available"}
                  </p>
                  <p className="empty-subtext">
                    {searchTerm || selectedDepartment 
                      ? "Try adjusting your filters" 
                      : "Check back later for new courses."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Course Material Modal */}
        {showMaterialModal && selectedCourse && (
          <div className="modal-overlay" onClick={() => setShowMaterialModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Course Materials</h3>
                  <p className="modal-subtitle">{selectedCourse.courseName} ({selectedCourse.courseCode})</p>
                </div>
                <button className="modal-close" onClick={() => setShowMaterialModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                <div className="course-info-section">
                  <div className="info-row">
                    <label>Instructor:</label>
                    <span>{selectedCourse.instructor}</span>
                  </div>
                  <div className="info-row">
                    <label>Credits:</label>
                    <span>{selectedCourse.credits}</span>
                  </div>
                  {selectedCourse.description && (
                    <div className="info-row">
                      <label>Description:</label>
                      <span>{selectedCourse.description}</span>
                    </div>
                  )}
                </div>

                <div className="materials-section">
                  <h4 className="section-title-small">Course Material</h4>
                  {selectedCourse.courseFile ? (
                    <div className="material-item">
                      <div className="material-info">
                        <span className="material-icon">{getFileIcon(selectedCourse.courseFile)}</span>
                        <span className="material-name">{getFileName(selectedCourse.courseFile)}</span>
                      </div>
                      <button 
                        className="btn-download-material"
                        onClick={() => {
                          handleDownloadMaterial(selectedCourse.id, getFileName(selectedCourse.courseFile));
                          setShowMaterialModal(false);
                        }}
                      >
                         Download
                      </button>
                    </div>
                  ) : (
                    <p className="no-material">No course material uploaded yet.</p>
                  )}
                </div>

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setShowMaterialModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enroll Confirmation Modal */}
        {showEnrollModal && enrollingCourse && (
          <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Confirm Enrollment</h3>
                  <p className="modal-subtitle">{enrollingCourse.courseName}</p>
                </div>
                <button className="modal-close" onClick={() => setShowEnrollModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                {successMsg && <div className="success-message">{successMsg}</div>}
                
                <div className="enroll-details">
                  <div className="detail-row">
                    <label>Course Code:</label>
                    <span>{enrollingCourse.courseCode}</span>
                  </div>
                  <div className="detail-row">
                    <label>Credits:</label>
                    <span>{enrollingCourse.credits}</span>
                  </div>
                  <div className="detail-row">
                    <label>Instructor:</label>
                    <span>{enrollingCourse.instructor}</span>
                  </div>
                  <div className="detail-row">
                    <label>Department:</label>
                    <span>{enrollingCourse.department}</span>
                  </div>
                </div>

                <div className="warning-message">
                  <p>⚠️ Are you sure you want to enroll in this course?</p>
                  <small>Once enrolled, you'll be able to access all course materials and assignments.</small>
                </div>

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setShowEnrollModal(false)}>
                    Cancel
                  </button>
                  <button className="btn-confirm-enroll" onClick={handleEnrollCourse} disabled={isLoading}>
                    {isLoading ? "Enrolling..." : "Confirm Enrollment"}
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

export default StudentCourses;