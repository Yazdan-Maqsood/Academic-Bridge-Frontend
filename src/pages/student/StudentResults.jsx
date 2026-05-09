import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./studentResults.css";

const StudentResults = () => {
  const [quizResults, setQuizResults] = useState([]);
  const [assignmentResults, setAssignmentResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all, quizzes, assignments
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch quiz results
  const handleGetQuizResults = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/get-quiz-results`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setQuizResults(response.data.results);
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
    }
  };

  // Fetch assignment results
  const handleGetAssignmentResults = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/get-assignment-results`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setAssignmentResults(response.data.results);
      }
    } catch (error) {
      console.error("Error fetching assignment results:", error);
    }
  };

  // Fetch courses
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

  // Get course name
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id == courseId);
    return course ? course.courseName : "Unknown Course";
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'passed': return 'status-passed';
      case 'failed': return 'status-failed';
      case 'graded': return 'status-graded';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  // Get grade letter
  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // View result details
  const handleViewDetails = (result, type) => {
    setSelectedResult({ ...result, type });
    setShowDetailModal(true);
  };

  // Combine and filter results
  const getAllResults = () => {
    const quizResultsFormatted = quizResults.map(r => ({
      ...r,
      type: 'quiz',
      title: r.quizTitle,
      totalMarks: r.totalMarks,
      obtainedMarks: r.obtainedMarks,
      percentage: r.percentage,
      status: r.status,
      submittedAt: r.submittedAt,
      gradedAt: r.gradedAt,
      feedback: r.feedback,
      passingMarks: r.passingMarks
    }));

    const assignmentResultsFormatted = assignmentResults.map(r => ({
      ...r,
      type: 'assignment',
      title: r.assignmentTitle,
      totalMarks: r.totalMarks,
      obtainedMarks: r.obtainedMarks,
      percentage: r.percentage,
      status: r.status,
      submittedAt: r.submittedAt,
      gradedAt: r.gradedAt,
      feedback: r.feedback
    }));

    let allResults = [...quizResultsFormatted, ...assignmentResultsFormatted];

    // Apply filters
    allResults = allResults.filter(result => {
      const matchesSearch = 
        result.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCourseName(result.courseId)?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCourse = !selectedCourse || result.courseId == selectedCourse;
      
      return matchesSearch && matchesCourse;
    });

    // Apply tab filter
    if (activeTab === 'quizzes') {
      allResults = allResults.filter(r => r.type === 'quiz');
    } else if (activeTab === 'assignments') {
      allResults = allResults.filter(r => r.type === 'assignment');
    }

    // Sort by date (newest first)
    allResults.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    return allResults;
  };

  // Calculate statistics
  const calculateStats = () => {
    const allResults = getAllResults();
    const totalAssessments = allResults.length;
    const passedCount = allResults.filter(r => r.status === 'Passed' || r.status === 'Graded').length;
    const failedCount = allResults.filter(r => r.status === 'Failed').length;
    const pendingCount = allResults.filter(r => r.status === 'Pending').length;
    
    const averagePercentage = allResults.length > 0 
      ? allResults.reduce((sum, r) => sum + (parseFloat(r.percentage) || 0), 0) / allResults.length 
      : 0;
    
    const bestScore = allResults.length > 0 
      ? Math.max(...allResults.map(r => parseFloat(r.percentage) || 0)) 
      : 0;
    
    return { totalAssessments, passedCount, failedCount, pendingCount, averagePercentage, bestScore };
  };

  const stats = calculateStats();
  const allResults = getAllResults();

  useEffect(() => {
    handleGetQuizResults();
    handleGetAssignmentResults();
    handleGetCourses();
  }, []);

  return (
    <div className="student-results">
      <div className="results-container">
        
        {/* Header Banner */}
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">My Results 📊</h1>
              <p className="header-subtitle">View your quiz and assignment results and track your academic progress.</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid mb-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <p className="stat-label">Total Assessments</p>
              <h3 className="stat-value">{stats.totalAssessments}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <p className="stat-label">Passed</p>
              <h3 className="stat-value">{stats.passedCount}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-danger">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <p className="stat-label">Failed</p>
              <h3 className="stat-value">{stats.failedCount}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <p className="stat-label">Pending</p>
              <h3 className="stat-value">{stats.pendingCount}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <p className="stat-label">Average Score</p>
              <h3 className="stat-value">{stats.averagePercentage.toFixed(1)}%</h3>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <p className="stat-label">Best Score</p>
              <h3 className="stat-value">{stats.bestScore.toFixed(1)}%</h3>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-section mb-4">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Results
          </button>
          <button 
            className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            Quizzes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="filter-section mb-4">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by assessment or course..." 
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
            <p>Loading results...</p>
          </div>
        ) : (
          <div className="results-list">
            {allResults.map((result, index) => {
              const gradeLetter = getGradeLetter(result.percentage);
              const isPassed = result.status === 'Passed' || result.status === 'Graded';
              
              return (
                <div key={`${result.type}-${result.id}-${index}`} className={`result-card ${isPassed ? 'passed' : result.status === 'Failed' ? 'failed' : 'pending'}`}>
                  <div className="result-card-header">
                    <div className="result-icon">
                      {result.type === 'quiz' ? '📋' : '📝'}
                    </div>
                    <div className="result-info">
                      <h3 className="result-title">{result.title}</h3>
                      <p className="result-course">{getCourseName(result.courseId)}</p>
                    </div>
                    <div className="result-badge">
                      <span className={`type-badge type-${result.type}`}>
                        {result.type === 'quiz' ? 'Quiz' : 'Assignment'}
                      </span>
                      <span className={`status-badge ${getStatusClass(result.status)}`}>
                        {result.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="result-card-body">
                    <div className="score-section">
                      <div className="score-circle">
                        <svg viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6"/>
                          <circle 
                            cx="50" cy="50" r="45" fill="none" 
                            stroke={isPassed ? '#10B981' : result.status === 'Failed' ? '#EF4444' : '#F59E0B'} 
                            strokeWidth="6"
                            strokeDasharray={`${(result.percentage / 100) * 283} 283`}
                            strokeDashoffset="0"
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="circle-content">
                          <span className="percentage">{result.percentage}%</span>
                    
                        </div>
                      </div>
                      <div className="score-details">
                        <div className="score-row">
                          <span className="score-label">Your Score:</span>
                          <span className="score-value">{result.obtainedMarks || 0}</span>
                          <span className="score-total">/{result.totalMarks}</span>
                        </div>
                        <div className="score-row">
                          <span className="score-label">Grade:</span>
                          <span className="grade-badge">{gradeLetter}</span>
                        </div>
                        {result.passingMarks && (
                          <div className="score-row">
                            <span className="score-label">Passing Marks:</span>
                            <span className="score-passing">{result.passingMarks}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="result-meta">
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span>Submitted: {formatDate(result.submittedAt)}</span>
                      </div>
                      {result.gradedAt && (
                        <div className="meta-item">
                          <span className="meta-icon">✅</span>
                          <span>Graded: {formatDate(result.gradedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="result-card-footer">
                    <button 
                      className="btn-view-details"
                      onClick={() => handleViewDetails(result, result.type)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}

            {allResults.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-content">
                  <div className="empty-icon">📊</div>
                  <p className="empty-text">No results found</p>
                  <p className="empty-subtext">
                    {searchTerm || selectedCourse 
                      ? "Try adjusting your filters" 
                      : "Complete quizzes and assignments to see your results here."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Result Detail Modal */}
        {showDetailModal && selectedResult && (
          <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Result Details</h3>
                  <p className="modal-subtitle">{selectedResult.title}</p>
                </div>
                <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                <div className="detail-section">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Type:</label>
                      <span className={`type-badge type-${selectedResult.type}`}>
                        {selectedResult.type === 'quiz' ? 'Quiz' : 'Assignment'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Course:</label>
                      <span>{getCourseName(selectedResult.courseId)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={`status-badge ${getStatusClass(selectedResult.status)}`}>
                        {selectedResult.status || 'Pending'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Submitted:</label>
                      <span>{formatDate(selectedResult.submittedAt)}</span>
                    </div>
                    {selectedResult.gradedAt && (
                      <div className="detail-item">
                        <label>Graded:</label>
                        <span>{formatDate(selectedResult.gradedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="score-detail-section">
                  <h4 className="section-title-small">Score Summary</h4>
                  <div className="score-summary">
                    <div className="summary-item">
                      <span className="summary-label">Obtained Marks</span>
                      <span className="summary-value">{selectedResult.obtainedMarks || 0}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total Marks</span>
                      <span className="summary-value">{selectedResult.totalMarks}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Percentage</span>
                      <span className="summary-value highlight">
                        {Number(selectedResult.percentage || 0).toFixed(1)}%
                      </span>
                    </div>
                    {selectedResult.passingMarks && (
                      <div className="summary-item">
                        <span className="summary-label">Passing Marks</span>
                        <span className="summary-value">{selectedResult.passingMarks}</span>
                      </div>
                    )}
                    <div className="summary-item">
                      <span className="summary-label">Grade</span>
                      <span className="grade-badge-large">{getGradeLetter(selectedResult.percentage)}</span>
                    </div>
                  </div>
                </div>

                {selectedResult.feedback && (
                  <div className="feedback-section">
                    <h4 className="section-title-small">Feedback</h4>
                    <div className="feedback-content">
                      <p>{selectedResult.feedback}</p>
                    </div>
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

export default StudentResults;