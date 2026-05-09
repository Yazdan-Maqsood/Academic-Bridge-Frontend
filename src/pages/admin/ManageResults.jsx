import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./manageResults.css";

const ManageResults = () => {
  const [quizResults, setQuizResults] = useState([]);
  const [assignmentResults, setAssignmentResults] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [activeTab, setActiveTab] = useState("quizzes");
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [resultType, setResultType] = useState(null);
  const [gradeFormData, setGradeFormData] = useState({
    obtainedMarks: "",
    feedback: "",
    status: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch quiz results
  const handleGetQuizResults = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/get-quiz-results`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (response.status === 200) {
        setQuizResults(response.data.results);
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
    }
  };

  // Fetch assignment results (graded only)
  const handleGetAssignmentResults = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/get-assignment-results`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (response.status === 200) {
        setAssignmentResults(response.data.results);
      }
    } catch (error) {
      console.error("Error fetching assignment results:", error);
    }
  };

  // Fetch pending submissions (ungraded assignments)
  const handleGetPendingSubmissions = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/get-pending-submissions`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (response.status === 200) {
        setPendingSubmissions(response.data.submissions);
      }
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
    }
  };

  // Fetch students
  const handleGetStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/get-students`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (response.status === 200) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch courses
  const handleGetCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/get-courses`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (response.status === 200) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Fetch quizzes
  const handleGetQuizzes = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/get-quizzes`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (response.status === 200) {
        setQuizzes(response.data.quizzes);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  // Fetch assignments
  const handleGetAssignments = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/get-assignments`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (response.status === 200) {
        setAssignments(response.data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Grade a pending assignment submission
  const handleGradePendingAssignment = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/admin/grade-assignment/${selectedResult.id}`, gradeFormData, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        alert("Assignment graded successfully!");
        setShowGradeModal(false);
        resetGradeForm();
        // Refresh all data
        await handleGetPendingSubmissions();
        await handleGetAssignmentResults();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to grade assignment");
    } finally {
      setIsLoading(false);
    }
  };

  // Update quiz grade (existing)
  const handleUpdateQuizGrade = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/admin/update-quiz-results/${selectedResult.id}`, gradeFormData, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        setQuizResults(quizResults.map(result => 
          result.id === selectedResult.id ? response.data.result : result
        ));
        setShowGradeModal(false);
        resetGradeForm();
        alert("Quiz grade updated successfully!");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to update grade");
    } finally {
      setIsLoading(false);
    }
  };

  // Update assignment grade (existing - for editing)
  const handleUpdateAssignmentGrade = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/admin/update-assignment-results/${selectedResult.id}`, gradeFormData, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        setAssignmentResults(assignmentResults.map(result => 
          result.id === selectedResult.id ? response.data.result : result
        ));
        setShowGradeModal(false);
        resetGradeForm();
        alert("Assignment grade updated successfully!");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to update grade");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset grade form
  const resetGradeForm = () => {
    setGradeFormData({
      obtainedMarks: "",
      feedback: "",
      status: ""
    });
    setSelectedResult(null);
    setResultType(null);
  };

  // Open grade modal for quiz
  const handleGradeQuizClick = (result) => {
    setSelectedResult(result);
    setResultType("quiz");
    setGradeFormData({
      obtainedMarks: result.obtainedMarks || "",
      feedback: result.feedback || "",
      status: result.status || "Pending"
    });
    setShowGradeModal(true);
  };

  // Open grade modal for assignment (edit existing)
  const handleGradeAssignmentClick = (result) => {
    setSelectedResult(result);
    setResultType("assignment");
    setGradeFormData({
      obtainedMarks: result.obtainedMarks || "",
      feedback: result.feedback || "",
      status: result.status || "Pending"
    });
    setShowGradeModal(true);
  };

  // Open grade modal for pending submission
  const handleGradePendingClick = (submission) => {
    setSelectedResult(submission);
    setResultType("pending");
    setGradeFormData({
      obtainedMarks: "",
      feedback: "",
      status: "Pending"
    });
    setShowGradeModal(true);
  };

  // Get student name
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id == studentId);
    return student ? student.studentName : "Unknown Student";
  };

  // Get course name from quiz or assignment
  const getCourseNameFromQuiz = (quizId) => {
    const quiz = quizzes.find(q => q.id == quizId);
    return quiz ? quiz.courseName : "Unknown Course";
  };

  const getCourseNameFromAssignment = (assignmentId) => {
    const assignment = assignments.find(a => a.id == assignmentId);
    return assignment ? assignment.courseName : "Unknown Course";
  };

  // Get quiz title
  const getQuizTitle = (quizId) => {
    const quiz = quizzes.find(q => q.id == quizId);
    return quiz ? quiz.title : "Unknown Quiz";
  };

  // Get assignment title
  const getAssignmentTitle = (assignmentId) => {
    const assignment = assignments.find(a => a.id == assignmentId);
    return assignment ? assignment.title : "Unknown Assignment";
  };

  // Get total marks
  const getQuizTotalMarks = (quizId) => {
    const quiz = quizzes.find(q => q.id == quizId);
    return quiz ? quiz.totalMarks : 0;
  };

  const getAssignmentTotalMarks = (assignmentId) => {
    const assignment = assignments.find(a => a.id == assignmentId);
    return assignment ? assignment.totalMarks : 0;
  };

  // Calculate percentage
  const calculatePercentage = (obtained, total) => {
    if (!obtained || !total) return 0;
    return ((obtained / total) * 100).toFixed(1);
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'passed': return 'status-passed';
      case 'failed': return 'status-failed';
      case 'pending': return 'status-pending';
      case 'graded': return 'status-passed';
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

  // Get current results based on active tab
  const getCurrentResults = () => {
    if (activeTab === 'quizzes') {
      return quizResults.filter(result => {
        const studentName = getStudentName(result.studentId)?.toLowerCase();
        const quizTitle = getQuizTitle(result.quizId)?.toLowerCase();
        const courseName = getCourseNameFromQuiz(result.quizId)?.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        const matchesSearch = studentName?.includes(search) || quizTitle?.includes(search) || courseName?.includes(search);
        const matchesCourse = !selectedCourse || getCourseNameFromQuiz(result.quizId) == selectedCourse;
        
        return matchesSearch && matchesCourse;
      });
    } else if (activeTab === 'assignments') {
      return assignmentResults.filter(result => {
        const studentName = getStudentName(result.studentId)?.toLowerCase();
        const assignmentTitle = getAssignmentTitle(result.assignmentId)?.toLowerCase();
        const courseName = getCourseNameFromAssignment(result.assignmentId)?.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        const matchesSearch = studentName?.includes(search) || assignmentTitle?.includes(search) || courseName?.includes(search);
        const matchesCourse = !selectedCourse || getCourseNameFromAssignment(result.assignmentId) == selectedCourse;
        
        return matchesSearch && matchesCourse;
      });
    } else {
      // Pending submissions tab
      return pendingSubmissions.filter(submission => {
        const studentName = getStudentName(submission.studentId)?.toLowerCase();
        const assignmentTitle = getAssignmentTitle(submission.assignmentId)?.toLowerCase();
        const courseName = getCourseNameFromAssignment(submission.assignmentId)?.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        const matchesSearch = studentName?.includes(search) || assignmentTitle?.includes(search) || courseName?.includes(search);
        const matchesCourse = !selectedCourse || getCourseNameFromAssignment(submission.assignmentId) == selectedCourse;
        const matchesAssignment = !selectedAssignment || submission.assignmentId == selectedAssignment;
        
        return matchesSearch && matchesCourse && matchesAssignment;
      });
    }
  };

  // Calculate statistics for current tab
  const getStats = () => {
    const currentResults = getCurrentResults();
    const total = currentResults.length;
    
    if (activeTab === 'pending') {
      return { total, pending: total, passed: 0, failed: 0 };
    }
    
    const pending = currentResults.filter(r => r.status === 'Pending').length;
    const passed = currentResults.filter(r => r.status === 'Passed').length;
    const failed = currentResults.filter(r => r.status === 'Failed').length;
    
    return { total, pending, passed, failed };
  };

  const stats = getStats();
  const currentResults = getCurrentResults();

  useEffect(() => {
    handleGetQuizResults();
    handleGetAssignmentResults();
    handleGetPendingSubmissions();
    handleGetStudents();
    handleGetCourses();
    handleGetQuizzes();
    handleGetAssignments();
  }, []);

  return (
    <div className="manage-results">
      <div className="results-container">
        
        {/* Header Banner */}
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">Manage Results 📊</h1>
              <p className="header-subtitle">View, manage, and grade student quiz and assignment results.</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid mb-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <p className="stat-label">Total Submissions</p>
              <h3 className="stat-value">{stats.total}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <p className="stat-label">Pending Grading</p>
              <h3 className="stat-value">{stats.pending}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <p className="stat-label">Passed</p>
              <h3 className="stat-value">{stats.passed}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-danger">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <p className="stat-label">Failed</p>
              <h3 className="stat-value">{stats.failed}</h3>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-section mb-4">
          <button 
            className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            📋 Quiz Results
          </button>
          <button 
            className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            📝 Assignment Results
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ✏️ Pending Grading ({pendingSubmissions.length})
          </button>
        </div>

        {/* Assignment Filter (only for pending tab) */}
        {activeTab === 'pending' && (
          <div className="assignment-filter mb-4">
            <select
              className="filter-select"
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
            >
              <option value="">All Assignments</option>
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="filter-section mb-4">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder={`Search by student, ${activeTab === 'quizzes' ? 'quiz' : 'assignment'} or course...`} 
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
          <div className="results-card">
            <div className="table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>{activeTab === 'quizzes' ? 'Quiz' : 'Assignment'}</th>
                    <th>Obtained</th>
                    <th>Total</th>
                    <th>%</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentResults.map((result) => {
                    let totalMarks, percentage, gradeLetter, title;
                    
                    if (activeTab === 'quizzes') {
                      totalMarks = getQuizTotalMarks(result.quizId);
                      percentage = calculatePercentage(result.obtainedMarks, totalMarks);
                      gradeLetter = getGradeLetter(percentage);
                      title = getQuizTitle(result.quizId);
                    } else if (activeTab === 'assignments') {
                      totalMarks = getAssignmentTotalMarks(result.assignmentId);
                      percentage = calculatePercentage(result.obtainedMarks, totalMarks);
                      gradeLetter = getGradeLetter(percentage);
                      title = getAssignmentTitle(result.assignmentId);
                    } else {
                      totalMarks = result.totalMarks;
                      percentage = '—';
                      gradeLetter = '—';
                      title = getAssignmentTitle(result.assignmentId);
                    }
                    
                    return (
                      <tr key={`${activeTab}-${result.id}`}>
                        <td className="student-name">
                          <div className="student-info">
                            <div className="student-avatar">
                              {getStudentName(result.studentId)?.charAt(0) || 'S'}
                            </div>
                            <span>{getStudentName(result.studentId)}</span>
                          </div>
                        </td>
                        <td className="assessment-title">{title}</td>
                        <td className="obtained-marks">
                          {result.obtainedMarks ? (
                            <span className="marks-value">{result.obtainedMarks}</span>
                          ) : (
                            <span className="marks-pending">—</span>
                          )}
                        </td>
                        <td className="total-marks">{totalMarks}</td>
                        <td className="percentage">
                          {result.obtainedMarks ? (
                            <span className={`percentage-badge ${percentage >= 60 ? 'good' : percentage >= 40 ? 'average' : 'poor'}`}>
                              {percentage}%
                            </span>
                          ) : (
                            <span className="percentage-pending">—</span>
                          )}
                        </td>
                        <td className="grade">
                          {result.obtainedMarks ? (
                            <span className="grade-badge">{gradeLetter}</span>
                          ) : (
                            <span className="grade-pending">—</span>
                          )}
                        </td>
                        <td className="status-cell">
                          <span className={`status-badge ${getStatusClass(result.status)}`}>
                            {result.status || 'Pending'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          {activeTab === 'pending' ? (
                            <button 
                              className="action-badge action-badge-grade" 
                              onClick={() => handleGradePendingClick(result)}
                            >
                              🎯 Grade Now
                            </button>
                          ) : (
                            <button 
                              className="action-badge action-badge-grade" 
                              onClick={() => activeTab === 'quizzes' 
                                ? handleGradeQuizClick(result)
                                : handleGradeAssignmentClick(result)
                              }
                            >
                              {result.obtainedMarks ? '✏️ Edit' : '🎯 Grade'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {currentResults.length === 0 && (
                    <tr className="empty-state">
                      <td colSpan="8">
                        <div className="empty-state-content">
                          <div className="empty-icon">
                            {activeTab === 'quizzes' ? '📋' : activeTab === 'assignments' ? '📝' : '✏️'}
                          </div>
                          <p className="empty-text">
                            {searchTerm || selectedCourse 
                              ? "No matching results found" 
                              : activeTab === 'pending' 
                                ? "No pending submissions" 
                                : `No ${activeTab === 'quizzes' ? 'quiz' : 'assignment'} results found`}
                          </p>
                          <p className="empty-subtext">
                            {searchTerm || selectedCourse 
                              ? "Try adjusting your filters" 
                              : activeTab === 'pending'
                                ? "Submissions will appear here when students submit assignments."
                                : "Results will appear here once students submit their work."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grade Modal */}
        {showGradeModal && selectedResult && (
          <div className="modal-overlay" onClick={() => setShowGradeModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Grade Submission</h3>
                  <p className="modal-subtitle">
                    {getStudentName(selectedResult.studentId)} - {resultType === 'quiz' 
                      ? getQuizTitle(selectedResult.quizId) 
                      : resultType === 'assignment'
                        ? getAssignmentTitle(selectedResult.assignmentId)
                        : getAssignmentTitle(selectedResult.assignmentId)}
                  </p>
                </div>
                <button className="modal-close" onClick={() => setShowGradeModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                
                <div className="details-section">
                  <div className="info-row">
                    <label>Student:</label>
                    <span>{getStudentName(selectedResult.studentId)}</span>
                  </div>
                  <div className="info-row">
                    <label>Type:</label>
                    <span className={`type-badge type-${resultType === 'quiz' ? 'quiz' : 'assignment'}`}>
                      {resultType === 'quiz' ? '📋 Quiz' : '📝 Assignment'}
                    </span>
                  </div>
                  <div className="info-row">
                    <label>Total Marks:</label>
                    <span>
                      {resultType === 'quiz' 
                        ? getQuizTotalMarks(selectedResult.quizId)
                        : selectedResult.totalMarks || getAssignmentTotalMarks(selectedResult.assignmentId)}
                    </span>
                  </div>
                  {resultType === 'pending' && selectedResult.submissionText && (
                    <div className="info-row full-width">
                      <label>Submission Text:</label>
                      <div className="submission-text-preview">
                        {selectedResult.submissionText}
                      </div>
                    </div>
                  )}
                  {resultType === 'pending' && selectedResult.submissionFile && (
                    <div className="info-row full-width">
                      <label>Attachment:</label>
                      <a 
                        href={`${API_URL}/${selectedResult.submissionFile}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="download-link"
                      >
                         View Submission
                      </a>
                    </div>
                  )}
                </div>

                <form onSubmit={
                  resultType === 'quiz' 
                    ? handleUpdateQuizGrade 
                    : resultType === 'pending'
                      ? handleGradePendingAssignment
                      : handleUpdateAssignmentGrade
                }>
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">⭐</span>
                      Obtained Marks
                    </label>
                    <input 
                      type="number"
                      name="obtainedMarks"
                      className="form-input"
                      value={gradeFormData.obtainedMarks}
                      onChange={(e) => setGradeFormData({...gradeFormData, obtainedMarks: e.target.value})}
                      placeholder="Enter obtained marks"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">💬</span>
                      Feedback (Optional)
                    </label>
                    <textarea
                      name="feedback"
                      className="form-textarea"
                      style={{resize: "none"}}
                      value={gradeFormData.feedback}
                      onChange={(e) => setGradeFormData({...gradeFormData, feedback: e.target.value})}
                      placeholder="Enter feedback for the student..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📌</span>
                      Status
                    </label>
                    <select
                      name="status"
                      value={gradeFormData.status}
                      className="form-input"
                      onChange={(e) => setGradeFormData({...gradeFormData, status: e.target.value})}
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="Passed">Passed</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowGradeModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Grade"}
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

export default ManageResults;