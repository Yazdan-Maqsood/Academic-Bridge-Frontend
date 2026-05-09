import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./manageQuizzes.css";

const ManageQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
    startDate: "",
    endDate: "",
    instructions: ""
  });
  
  const [editFormData, setEditFormData] = useState({
    id: "",
    title: "",
    description: "",
    courseId: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
    startDate: "",
    endDate: "",
    instructions: "",
    status: "Active"
  });

  const [questionFormData, setQuestionFormData] = useState({
    quizId: "",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "",
    marks: ""
  });

  // Fetch all quizzes
  const handleGetQuizzes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/admin/get-quizzes`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setQuizzes(response.data.quizzes);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setErrorMsg("Failed to load quizzes");
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

  // Fetch questions for a quiz
  const handleGetQuestions = async (quizId) => {
    
    console.log('quizID : ', quizId);
    
    try {
      const response = await axios.get(`${API_URL}/admin/get-questions/${quizId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
          console.log('questions : ', response)
          setQuestions(response.data.questions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
    }
  };

  // Add new quiz
  const handleAddQuiz = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/admin/add-quiz`, formData, {
        withCredentials: true
      });
      
      if (response.status === 201) {
        setQuizzes([...quizzes, response.data.quiz]);
        setShowModal(false);
        resetForm();
        alert("Quiz added successfully!");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setErrorMsg("Quiz already exists");
      } else {
        setErrorMsg(error.response?.data?.message || "Failed to add quiz");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update quiz
  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/admin/update-quiz/${editFormData.id}`, editFormData, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        setQuizzes(quizzes.map(quiz => 
          quiz.id === editFormData.id ? response.data.quiz : quiz
        ));
        setShowEditModal(false);
        resetEditForm();
        alert("Quiz updated successfully!");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to update quiz");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async (quizId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will also delete all questions.`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.delete(`${API_URL}/admin/delete-quiz/${quizId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
        alert("Quiz deleted successfully!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "Failed to delete quiz");
    } finally {
      setIsLoading(false);
    }
  };

  // Add question to quiz
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/admin/add-question`, questionFormData, {
        withCredentials: true
      });
      
      if (response.status === 201) {
        setQuestionFormData({
          quizId: selectedQuiz.id,
          questionText: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "",
          marks: ""
        });
        handleGetQuestions();
        alert("Question added successfully!");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to add question");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.delete(`${API_URL}/admin/delete-question/${questionId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        await handleGetQuestions(selectedQuiz.id);
        alert("Question deleted successfully!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "Failed to delete question");
    } finally {
      setIsLoading(false);
    }
  };

  // View quiz details
  const handleViewQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    await handleGetQuestions(quiz.id);
    setShowViewModal(true);
  };

  // Manage questions
  const handleManageQuestions = async (quiz) => {
    setSelectedQuiz(quiz);
    setQuestionFormData({ ...questionFormData, quizId: quiz.id });
    await handleGetQuestions(quiz.id);
    setShowQuestionsModal(true);
  };

  // Open edit modal with quiz data
  const handleEditClick = (quiz) => {
    setEditFormData({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description || "",
      courseId: quiz.courseId,
      duration: quiz.duration,
      totalMarks: quiz.totalMarks,
      passingMarks: quiz.passingMarks,
      startDate: quiz.startDate?.split('T')[0] || quiz.startDate,
      endDate: quiz.endDate?.split('T')[0] || quiz.endDate,
      instructions: quiz.instructions || "",
      status: quiz.status
    });
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      courseId: "",
      duration: "",
      totalMarks: "",
      passingMarks: "",
      startDate: "",
      endDate: "",
      instructions: ""
    });
  };

  const resetEditForm = () => {
    setEditFormData({
      id: "",
      title: "",
      description: "",
      courseId: "",
      duration: "",
      totalMarks: "",
      passingMarks: "",
      startDate: "",
      endDate: "",
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

  const handleQuestionInputChange = (e) => {
    setQuestionFormData({ ...questionFormData, [e.target.name]: e.target.value });
  };

  // Get course name by ID
    const getCourseName = (courseId) => {
        const course = courses.find(c => c.id == courseId); 
        return course ? course.courseName : "Unknown Course";
    };


  // Check if quiz is active (within date range)
  const isQuizActive = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter quizzes based on search
  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCourseName(quiz.courseId)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    handleGetQuizzes();
    handleGetCourses();
  }, []);

  return (
    <div className="manage-quizzes">
      <div className="quizzes-container">
        
        {/* Header Banner */}
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">Manage Quizzes 📋</h1>
              <p className="header-subtitle">Create, edit, and manage all course quizzes in the portal.</p>
            </div>
            <button 
              className="btn-add-quiz"
              onClick={() => setShowModal(true)}
            >
              <span className="btn-icon">➕</span>
              Add New Quiz
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid mb-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <p className="stat-label">Total Quizzes</p>
              <h3 className="stat-value">{quizzes.length}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <p className="stat-label">Active Quizzes</p>
              <h3 className="stat-value">{quizzes.filter(q => q.status === 'Active').length}</h3>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <p className="stat-label">Live Now</p>
              <h3 className="stat-value">{quizzes.filter(q => isQuizActive(q.startDate, q.endDate) && q.status === 'Active').length}</h3>
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

        {/* Quizzes Table Card */}
        <div className="quizzes-card">
          <div className="card-header-custom">
            <div>
              <h3 className="card-title">Quiz Records</h3>
              <p className="card-subtitle">Showing {filteredQuizzes.length} of {quizzes.length} quizzes</p>
            </div>
            <div className="header-actions">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search quizzes by title, course or status..." 
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
              <p>Loading quizzes...</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="quizzes-table">
                <thead>
                  <tr>
                    <th className="col-title">Quiz Title</th>
                    <th className="col-course">Course</th>
                    <th className="col-duration">Duration</th>
                    <th className="col-marks">Total Marks</th>
                    <th className="col-passing">Passing Marks</th>
                    <th className="col-date">Date Range</th>
                    <th className="col-status">Status</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((quiz) => (
                    <tr key={quiz.id}>
                      <td className="quiz-title">
                        <div className="title-info">
                          <div className="title-icon">📋</div>
                          <span>{quiz.title}</span>
                        </div>
                      </td>
                      <td className="course-name">{getCourseName(quiz.courseId)}</td>
                      <td className="duration">
                        <span className="duration-badge">⏱️ {quiz.duration} min</span>
                      </td>
                      <td className="total-marks">
                        <span className="marks-badge">{quiz.totalMarks} pts</span>
                      </td>
                      <td className="passing-marks">
                        <span className={`passing-badge ${quiz.passingMarks >= quiz.totalMarks / 2 ? 'good' : 'low'}`}>
                          {quiz.passingMarks} pts
                        </span>
                      </td>
                      <td className="date-range">
                        <div className="date-info">
                          <span>📅 {formatDate(quiz.startDate)}</span>
                          <span>→</span>
                          <span>📅 {formatDate(quiz.endDate)}</span>
                        </div>
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge status-${quiz.status?.toLowerCase()}`}>
                          {quiz.status || 'Active'}
                        </span>
                        {isQuizActive(quiz.startDate, quiz.endDate) && quiz.status === 'Active' && (
                          <span className="live-badge">LIVE</span>
                        )}
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="action-badge action-badge-questions" 
                          title="Manage Questions"
                          onClick={() => handleManageQuestions(quiz)}
                        >
                           Questions
                        </button>
                        <button 
                          className="action-badge action-badge-view" 
                          title="View Details"
                          onClick={() => handleViewQuiz(quiz)}
                        >
                           View
                        </button>
                        <button 
                          className="action-badge action-badge-edit" 
                          title="Edit Quiz"
                          onClick={() => handleEditClick(quiz)}
                        >
                           Edit
                        </button>
                        <button 
                          className="action-badge action-badge-delete" 
                          title="Delete Quiz"
                          onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                        >
                           Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredQuizzes.length === 0 && (
                    <tr className="empty-state">
                      <td colSpan="8">
                        <div className="empty-state-content">
                          <div className="empty-icon">📋</div>
                          <p className="empty-text">
                            {searchTerm ? "No matching quizzes found" : "No quizzes found"}
                          </p>
                          <p className="empty-subtext">
                            {searchTerm 
                              ? `No quizzes match "${searchTerm}"` 
                              : 'Click the "Add New Quiz" button to get started.'}
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

        {/* Add Quiz Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Add New Quiz</h3>
                  <p className="modal-subtitle">Create a new quiz for a course</p>
                </div>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                <form onSubmit={handleAddQuiz}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">📌</span>
                        Quiz Title
                      </label>
                      <input 
                        type="text" 
                        className="form-input"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Midterm Exam - Database Systems" 
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
                        <span className="label-icon">⏱️</span>
                        Duration (minutes)
                      </label>
                      <input 
                        type="number"
                        name="duration"
                        className="form-input"
                        value={formData.duration}
                        onChange={handleInputChange}
                        placeholder="e.g., 60"
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

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">🎯</span>
                        Passing Marks
                      </label>
                      <input 
                        type="number"
                        name="passingMarks"
                        className="form-input"
                        value={formData.passingMarks}
                        onChange={handleInputChange}
                        placeholder="e.g., 40"
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">📅</span>
                        Start Date
                      </label>
                      <input 
                        type="datetime-local"
                        name="startDate"
                        className="form-input"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">📅</span>
                        End Date
                      </label>
                      <input 
                        type="datetime-local"
                        name="endDate"
                        className="form-input"
                        value={formData.endDate}
                        onChange={handleInputChange}
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
                      placeholder="Enter quiz description..."
                      style={{resize: "none"}}
                      rows="2"
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
                      placeholder="Enter quiz instructions, rules, etc..."
                      style={{resize: "none"}}
                      rows="2"
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Quiz"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Quiz Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Edit Quiz</h3>
                  <p className="modal-subtitle">Update quiz information</p>
                </div>
                <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                <form onSubmit={handleUpdateQuiz}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Quiz Title</label>
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
                      <label className="form-label">Duration (minutes)</label>
                      <input 
                        type="number"
                        name="duration"
                        className="form-input"
                        value={editFormData.duration}
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

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Passing Marks</label>
                      <input 
                        type="number"
                        name="passingMarks"
                        className="form-input"
                        value={editFormData.passingMarks}
                        onChange={handleEditInputChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input 
                        type="datetime-local"
                        name="startDate"
                        className="form-input"
                        value={editFormData.startDate}
                        onChange={handleEditInputChange}
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input 
                        type="datetime-local"
                        name="endDate"
                        className="form-input"
                        value={editFormData.endDate}
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
                      onChange={handleEditInputChange}
                      style={{resize: "none"}}
                      rows="2"
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
                      rows="2"
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
                      {isLoading ? "Updating..." : "Update Quiz"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Manage Questions Modal */}
        {showQuestionsModal && selectedQuiz && (
          <div className="modal-overlay" onClick={() => setShowQuestionsModal(false)}>
            <div className="modal-container modal-xlarge" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Manage Questions</h3>
                  <p className="modal-subtitle">{selectedQuiz.title} - Add and manage quiz questions</p>
                </div>
                <button className="modal-close" onClick={() => setShowQuestionsModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                
                {/* Add Question Form */}
                <div className="add-question-section">
                  <h4 className="section-title-small">Add New Question</h4>
                  <form onSubmit={handleAddQuestion}>
                    <div className="form-group">
                      <label className="form-label">Question Text</label>
                      <textarea
                        name="questionText"
                        className="form-textarea"
                        value={questionFormData.questionText}
                        onChange={handleQuestionInputChange}
                        placeholder="Enter the question..."
                        style={{resize: "none"}}
                        rows="2"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Option A</label>
                        <input 
                          type="text"
                          name="optionA"
                          className="form-input"
                          value={questionFormData.optionA}
                          onChange={handleQuestionInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Option B</label>
                        <input 
                          type="text"
                          name="optionB"
                          className="form-input"
                          value={questionFormData.optionB}
                          onChange={handleQuestionInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Option C</label>
                        <input 
                          type="text"
                          name="optionC"
                          className="form-input"
                          value={questionFormData.optionC}
                          onChange={handleQuestionInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Option D</label>
                        <input 
                          type="text"
                          name="optionD"
                          className="form-input"
                          value={questionFormData.optionD}
                          onChange={handleQuestionInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Correct Answer</label>
                        <select
                          name="correctAnswer"
                          value={questionFormData.correctAnswer}
                          className="form-input"
                          onChange={handleQuestionInputChange}
                          required
                        >
                          <option value="">Select Correct Answer</option>
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Marks</label>
                        <input 
                          type="number"
                          name="marks"
                          className="form-input"
                          value={questionFormData.marks}
                          onChange={handleQuestionInputChange}
                          placeholder="e.g., 5"
                          required
                        />
                      </div>
                    </div>

                    <div className="modal-actions">
                      <button type="submit" className="btn-submit" disabled={isLoading}>
                        {isLoading ? "Adding..." : "+ Add Question"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Questions List */}
                <div className="questions-list-section">
                  <h4 className="section-title-small">Questions ({questions.length})</h4>
                  {questions.length === 0 ? (
                    <div className="empty-questions">
                      <p>No questions added yet. Add your first question above.</p>
                    </div>
                  ) : (
                    <div className="questions-list">
                      {questions.map((question, index) => (
                        <div key={question.id} className="question-item">
                          <div className="question-header">
                            <span className="question-number">Q{index + 1}.</span>
                            <span className="question-text">{question.questionText}</span>
                            <button 
                              className="delete-question-btn"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              🗑️
                            </button>
                          </div>
                          <div className="question-options">
                            <div className={`option option-a ${question.correctAnswer === 'A' ? 'correct' : ''}`}>
                              A. {question.optionA}
                            </div>
                            <div className={`option option-b ${question.correctAnswer === 'B' ? 'correct' : ''}`}>
                              B. {question.optionB}
                            </div>
                            <div className={`option option-c ${question.correctAnswer === 'C' ? 'correct' : ''}`}>
                              C. {question.optionC}
                            </div>
                            <div className={`option option-d ${question.correctAnswer === 'D' ? 'correct' : ''}`}>
                              D. {question.optionD}
                            </div>
                          </div>
                          <div className="question-meta">
                            <span className="marks-badge-small">🎯 {question.marks} marks</span>
                            <span className="answer-badge">✓ Correct: {question.correctAnswer}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setShowQuestionsModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Quiz Modal */}
        {showViewModal && selectedQuiz && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Quiz Details</h3>
                  <p className="modal-subtitle">{selectedQuiz.title}</p>
                </div>
                <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Course</label>
                    <p>{getCourseName(selectedQuiz.courseId)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Duration</label>
                    <p>{selectedQuiz.duration} minutes</p>
                  </div>
                  <div className="detail-item">
                    <label>Total Marks</label>
                    <p>{selectedQuiz.totalMarks} points</p>
                  </div>
                  <div className="detail-item">
                    <label>Passing Marks</label>
                    <p>{selectedQuiz.passingMarks} points</p>
                  </div>
                  <div className="detail-item">
                    <label>Start Date</label>
                    <p>{formatDate(selectedQuiz.startDate)}</p>
                  </div>
                  <div className="detail-item">
                    <label>End Date</label>
                    <p>{formatDate(selectedQuiz.endDate)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <p>
                      <span className={`status-badge status-${selectedQuiz.status?.toLowerCase()}`}>
                        {selectedQuiz.status}
                      </span>
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Questions</label>
                    <p>{questions.length} questions</p>
                  </div>
                </div>

                {selectedQuiz.description && (
                  <div className="detail-section">
                    <label>Description</label>
                    <p>{selectedQuiz.description}</p>
                  </div>
                )}

                {selectedQuiz.instructions && (
                  <div className="detail-section">
                    <label>Instructions</label>
                    <p>{selectedQuiz.instructions}</p>
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
                      handleManageQuestions(selectedQuiz);
                    }}
                  >
                    Manage Questions
                  </button>
                  <button 
                    className="btn-submit"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditClick(selectedQuiz);
                    }}
                  >
                    Edit Quiz
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

export default ManageQuizzes;