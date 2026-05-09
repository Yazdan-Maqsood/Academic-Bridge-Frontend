import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./studentQuizzes.css";

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResult, setQuizResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch student's quizzes
  const handleGetQuizzes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/student/get-quizzes`, {
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

  // Fetch quiz questions
  const handleGetQuestions = async (quizId) => {
    try {
      const response = await axios.get(`${API_URL}/student/get-questions/${quizId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setQuestions(response.data.questions);
        // Initialize answers object
        const initialAnswers = {};
        response.data.questions.forEach(q => {
          initialAnswers[q.id] = "";
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setErrorMsg("Failed to load quiz questions");
    }
  };

  // Start quiz
  const handleStartQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    await handleGetQuestions(quiz.id);
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setTimeLeft(quiz.duration * 60); // Convert minutes to seconds
    setShowQuizModal(true);
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    // Check if all questions are answered
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      if (!window.confirm(`You have ${unanswered.length} unanswered question(s). Are you sure you want to submit?`)) {
        return;
      }
    }
    
    try {
      setIsLoading(true);
      
      const submissionData = {
        quizId: selectedQuiz.id,
        answers: answers
      };
      
      const response = await axios.post(`${API_URL}/student/submit-quiz`, submissionData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setQuizResult(response.data.result);
        setShowQuizModal(false);
        setQuizStarted(false);
        setQuestions([]);
        setAnswers({});
        setShowResultModal(true);
        handleGetQuizzes();
      }
    }
     catch (error) {
      console.error("Submit error:", error);
      setErrorMsg(error.response?.data?.message || "Failed to submit quiz");
    }
     finally {
      setIsLoading(false);
    }
  };

  // View result
  const handleViewResult = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizResult({
      obtainedMarks: quiz.obtainedMarks,
      totalMarks: quiz.totalMarks,
      percentage: ((quiz.obtainedMarks / quiz.totalMarks) * 100).toFixed(1),
      status: quiz.status,
      feedback: quiz.feedback,
      submittedAt: quiz.submittedAt,
      gradedAt: quiz.gradedAt
    });
    setShowResultModal(true);
  };

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    } else if (quizStarted && timeLeft === 0) {
      // Auto-submit when time runs out
      alert("Time's up! Submitting your quiz...");
      handleSubmitQuiz();
    }
  }, [quizStarted, timeLeft]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get course name
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id == courseId);
    return course ? course.courseName : "Unknown Course";
  };

  // Check if quiz is available
  const isQuizAvailable = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  // Check if quiz is upcoming
  const isQuizUpcoming = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    return now < start;
  };

  // Check if quiz is expired
  const isQuizExpired = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    return now > end;
  };

  // Check if student has already taken the quiz
  const hasTakenQuiz = (quiz) => {
    return quiz.status === 'Passed' || quiz.status === 'Failed';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter quizzes
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = 
      quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCourseName(quiz.courseId)?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = !selectedCourse || quiz.courseId == selectedCourse;
    
    return matchesSearch && matchesCourse;
  });

  // Statistics
  const totalQuizzes = filteredQuizzes.length;
  const availableCount = filteredQuizzes.filter(q => isQuizAvailable(q.startDate, q.endDate) && !hasTakenQuiz(q)).length;
  const completedCount = filteredQuizzes.filter(q => hasTakenQuiz(q)).length;
  const upcomingCount = filteredQuizzes.filter(q => isQuizUpcoming(q.startDate)).length;

  useEffect(() => {
    handleGetQuizzes();
    handleGetCourses();
  }, []);

  return (
    <div className="student-quizzes">
      <div className="quizzes-container">
        
        {/* Header Banner */}
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">My Quizzes 📋</h1>
              <p className="header-subtitle">Attempt quizzes and track your performance.</p>
            </div>
            <div className="header-stats">
              <div className="stat-chip">
                <span className="stat-icon">📋</span>
                <span className="stat-value">{totalQuizzes}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-chip available">
                <span className="stat-icon">🎯</span>
                <span className="stat-value">{availableCount}</span>
                <span className="stat-label">Available</span>
              </div>
              <div className="stat-chip completed">
                <span className="stat-icon">✅</span>
                <span className="stat-value">{completedCount}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-chip upcoming">
                <span className="stat-icon">📅</span>
                <span className="stat-value">{upcomingCount}</span>
                <span className="stat-label">Upcoming</span>
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
              placeholder="Search quizzes by title or course..." 
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
            <p>Loading quizzes...</p>
          </div>
        ) : (
          <div className="quizzes-grid">
            {filteredQuizzes.map((quiz) => {
              const available = isQuizAvailable(quiz.startDate, quiz.endDate);
              const upcoming = isQuizUpcoming(quiz.startDate);
              const expired = isQuizExpired(quiz.endDate);
              const taken = hasTakenQuiz(quiz);
              
              return (
                <div key={quiz.id} className={`quiz-card ${taken ? 'taken' : available ? 'available' : 'unavailable'}`}>
                  <div className="quiz-card-header">
                    <div className="quiz-icon">
                      {taken ? '✅' : available ? '🎯' : '🔒'}
                    </div>
                    <div className="quiz-info">
                      <h3 className="quiz-title">{quiz.title}</h3>
                      <p className="quiz-course">{getCourseName(quiz.courseId)}</p>
                    </div>
                    <div className="quiz-badge">
                      {taken && (
                        <span className={`status-badge ${quiz.status === 'Passed' ? 'status-passed' : 'status-failed'}`}>
                          {quiz.status || 'Completed'}
                        </span>
                      )}
                      {available && !taken && (
                        <span className="status-badge status-available">Available</span>
                      )}
                      {upcoming && (
                        <span className="status-badge status-upcoming">Upcoming</span>
                      )}
                      {expired && !taken && (
                        <span className="status-badge status-expired">Expired</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="quiz-card-body">
                    {quiz.description && (
                      <p className="quiz-description">{quiz.description}</p>
                    )}
                    <div className="quiz-meta">
                      <div className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        <span>Duration: {quiz.duration} minutes</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">⭐</span>
                        <span>Total Marks: {quiz.totalMarks}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">🎯</span>
                        <span>Passing: {quiz.passingMarks} marks</span>
                      </div>
                    </div>
                    <div className="quiz-dates">
                      <div className="date-item">
                        <span>📅 Starts: {formatDate(quiz.startDate)}</span>
                      </div>
                      <div className="date-item">
                        <span>⏰ Ends: {formatDate(quiz.endDate)}</span>
                      </div>
                    </div>
                    {taken && quiz.obtainedMarks !== undefined && (
                      <div className="quiz-result-preview">
                        <div className="result-score">
                          <span className="score-label">Your Score:</span>
                          <span className="score-value">{quiz.obtainedMarks}</span>
                          <span className="score-total">/{quiz.totalMarks}</span>
                        </div>
                        <div className="result-percentage">
                          {((quiz.obtainedMarks / quiz.totalMarks) * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="quiz-card-footer">
                    {taken ? (
                      <button 
                        className="btn-view-result"
                        onClick={() => handleViewResult(quiz)}
                      >
                        View Result
                      </button>
                    ) : available ? (
                      <button 
                        className="btn-start-quiz"
                        onClick={() => handleStartQuiz(quiz)}
                      >
                        Start Quiz
                      </button>
                    ) : upcoming ? (
                      <button className="btn-upcoming" disabled>
                        Starts {new Date(quiz.startDate).toLocaleDateString()}
                      </button>
                    ) : (
                      <button className="btn-expired" disabled>
                        Quiz Expired
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredQuizzes.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-content">
                  <div className="empty-icon">📋</div>
                  <p className="empty-text">
                    {searchTerm || selectedCourse ? "No matching quizzes found" : "No quizzes available"}
                  </p>
                  <p className="empty-subtext">
                    {searchTerm || selectedCourse 
                      ? "Try adjusting your filters" 
                      : "Check back later for new quizzes"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Taking Modal */}
        {showQuizModal && selectedQuiz && (
          <div className="modal-overlay">
            <div className="modal-container quiz-modal">
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">{selectedQuiz.title}</h3>
                  <p className="modal-subtitle">{getCourseName(selectedQuiz.courseId)}</p>
                </div>
                <div className="timer-display">
                  <span className="timer-icon">⏱️</span>
                  <span className={`timer-value ${timeLeft < 60 ? 'timer-warning' : ''}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                
                {/* Question Navigation */}
                <div className="question-navigation">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      className={`nav-btn ${currentQuestionIndex === index ? 'active' : ''} ${answers[questions[index]?.id] ? 'answered' : ''}`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {/* Current Question */}
                {questions.length > 0 && (
                  <div className="question-container">
                    <div className="question-header">
                      <span className="question-number">Question {currentQuestionIndex + 1} of {questions.length}</span>
                      <span className="question-marks">Marks: {questions[currentQuestionIndex]?.marks}</span>
                    </div>
                    <div className="question-text">
                      {questions[currentQuestionIndex]?.questionText}
                    </div>
                    <div className="options-container">
                      {['A', 'B', 'C', 'D'].map(option => {
                        const optionKey = `option${option}`;
                        const optionText = questions[currentQuestionIndex]?.[optionKey];
                        if (!optionText) return null;
                        
                        return (
                          <label key={option} className={`option-label ${answers[questions[currentQuestionIndex]?.id] === option ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name={`question-${questions[currentQuestionIndex]?.id}`}
                              value={option}
                              checked={answers[questions[currentQuestionIndex]?.id] === option}
                              onChange={() => handleAnswerSelect(questions[currentQuestionIndex]?.id, option)}
                            />
                            <span className="option-letter">{option}.</span>
                            <span className="option-text">{optionText}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="quiz-actions">
                  <button 
                    className="btn-prev"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    ← Previous
                  </button>
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button 
                      className="btn-next"
                      onClick={handleNextQuestion}
                    >
                      Next →
                    </button>
                  ) : (
                    <button 
                      className="btn-submit-quiz"
                      onClick={handleSubmitQuiz}
                      disabled={isLoading}
                    >
                      {isLoading ? "Submitting..." : "Submit Quiz"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result Modal */}
        {showResultModal && quizResult && (
          <div className="modal-overlay" onClick={() => setShowResultModal(false)}>
            <div className="modal-container result-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Quiz Result</h3>
                  <p className="modal-subtitle">{selectedQuiz?.title}</p>
                </div>
                <button className="modal-close" onClick={() => setShowResultModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                <div className="result-card-main">
                  <div className="result-circle">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                      <circle 
                        cx="50" cy="50" r="45" fill="none" 
                        stroke={quizResult.percentage >= 60 ? '#10B981' : quizResult.percentage >= 40 ? '#F59E0B' : '#EF4444'} 
                        strokeWidth="8"
                        strokeDasharray={`${(quizResult.percentage / 100) * 283} 283`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="circle-content">
                      <span className="percentage">{quizResult.percentage}%</span>
                    </div>
                  </div>
                  
                  <div className="result-details">
                    <div className="result-row">
                      <label>Your Score:</label>
                      <span className="score">{quizResult.obtainedMarks} / {quizResult.totalMarks}</span>
                    </div>
                    <div className="result-row">
                      <label>Status:</label>
                      <span className={`status-badge ${quizResult.status === 'Passed' ? 'status-passed' : 'status-failed'}`}>
                        {quizResult.status}
                      </span>
                    </div>
                    {quizResult.submittedAt && (
                      <div className="result-row">
                        <label>Submitted:</label>
                        <span>{formatDate(quizResult.submittedAt)}</span>
                      </div>
                    )}
                    {quizResult.gradedAt && (
                      <div className="result-row">
                        <label>Graded:</label>
                        <span>{formatDate(quizResult.gradedAt)}</span>
                      </div>
                    )}
                    {quizResult.feedback && (
                      <div className="result-row feedback-row">
                        <label>Feedback:</label>
                        <p>{quizResult.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setShowResultModal(false)}>
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

export default StudentQuizzes;