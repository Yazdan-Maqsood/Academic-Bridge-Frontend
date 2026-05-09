import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "bootstrap/dist/css/bootstrap.min.css";
import "./studentDashboard.css";

const StudentDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    pendingAssignments: 0,
    unreadAnnouncements: 0,
    overallGrade: "N/A",
  });
  
  const [myCourses, setMyCourses] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
  });
  const [assignmentStats, setAssignmentStats] = useState({
    total: 0,
    submitted: 0,
    pending: 0,
  });

  // Fetch student profile
    const handleGetProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/student/get-profile`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        
        if (response.status === 200) {
          setUserName(response.data.profile.studentName)
        }
      }
       catch (error) {
        console.error("Error fetching username:", error);
        setErrorMsg("Failed to load profile");
      }
       finally {
        setIsLoading(false);
      }
    };

  // Fetch enrolled courses
  const handleGetEnrolledCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/get-courses`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setMyCourses(response.data.courses || []);
        setStats(prev => ({
          ...prev,
          enrolledCourses: response.data.courses?.length || 0
        }));
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  // Fetch assignments with submission status
  const handleGetAssignments = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/get-assignments`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        const assignments = response.data.assignments || [];
        
        // Count pending assignments (not submitted)
        const pendingCount = assignments.filter(a => a.status === 'Pending').length;
        
        // Get upcoming deadlines (assignments with due date in future, not submitted)
        const today = new Date();
        const upcoming = assignments
          .filter(a => a.status === 'Pending' && new Date(a.dueDate) >= today)
          .slice(0, 5)
          .map(a => ({
            id: a.id,
            title: a.title,
            course: a.courseName || "Course",
            due: new Date(a.dueDate).toLocaleDateString(),
            type: "Assignment"
          }));
        
        setUpcomingDeadlines(upcoming);
        setAssignmentStats({
          total: assignments.length,
          submitted: assignments.filter(a => a.status === 'Submitted' || a.status === 'Graded').length,
          pending: pendingCount
        });
        setStats(prev => ({
          ...prev,
          pendingAssignments: pendingCount
        }));
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Fetch announcements
  const handleGetAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/get-announcements`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        const announcements = response.data.announcements || [];
        
        // Count unread announcements
        const unreadCount = announcements.filter(a => !a.isRead).length;
        
        // Get recent announcements (last 3)
        const recent = announcements.slice(0, 3).map(a => ({
          id: a.id,
          text: a.title,
          date: new Date(a.createdAt).toLocaleDateString(),
          isRead: a.isRead
        }));
        
        setRecentAnnouncements(recent);
        setStats(prev => ({
          ...prev,
          unreadAnnouncements: unreadCount
        }));
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  // Fetch quiz results for overall grade calculation
  const handleGetQuizResults = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/get-quiz-results`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        const quizResults = response.data.results || [];
        const totalQuizzes = quizResults.length;
        
        // Calculate average percentage
        let totalPercentage = 0;
        quizResults.forEach(result => {
          totalPercentage += parseFloat(result.percentage) || 0;
        });
        const avgPercentage = totalQuizzes > 0 ? (totalPercentage / totalQuizzes).toFixed(1) : 0;
        
        setQuizStats({
          totalQuizzes: totalQuizzes,
          averageScore: avgPercentage
        });
        
        // Calculate overall grade based on average percentage
        let overallGrade = "N/A";
        if (avgPercentage >= 90) overallGrade = "A+";
        else if (avgPercentage >= 80) overallGrade = "A";
        else if (avgPercentage >= 70) overallGrade = "B";
        else if (avgPercentage >= 60) overallGrade = "C";
        else if (avgPercentage >= 50) overallGrade = "D";
        else if (avgPercentage > 0) overallGrade = "F";
        
        // If no quizzes taken, check assignment grades
        if (totalQuizzes === 0 && assignmentStats.submitted > 0) {
          overallGrade = "In Progress";
        }
        
        setStats(prev => ({
          ...prev,
          overallGrade: overallGrade
        }));
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
    }
  };

  // Fetch assignment results for overall grade
  const handleGetAssignmentResults = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/get-assignment-results`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        const assignmentResults = response.data.results || [];
        
        // Calculate average percentage from graded assignments
        let totalPercentage = 0;
        let gradedCount = 0;
        assignmentResults.forEach(result => {
          if (result.obtainedMarks) {
            totalPercentage += parseFloat(result.percentage) || 0;
            gradedCount++;
          }
        });
        const avgPercentage = gradedCount > 0 ? (totalPercentage / gradedCount).toFixed(1) : 0;
        
        // If no quizzes but have assignments, use assignment average for grade
        if (quizStats.totalQuizzes === 0 && gradedCount > 0) {
          let overallGrade = "N/A";
          if (avgPercentage >= 90) overallGrade = "A+";
          else if (avgPercentage >= 80) overallGrade = "A";
          else if (avgPercentage >= 70) overallGrade = "B";
          else if (avgPercentage >= 60) overallGrade = "C";
          else if (avgPercentage >= 50) overallGrade = "D";
          else if (avgPercentage > 0) overallGrade = "F";
          
          setStats(prev => ({
            ...prev,
            overallGrade: overallGrade
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching assignment results:", error);
    }
  };

  // Fetch upcoming quizzes
  const handleGetUpcomingQuizzes = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/get-quizzes`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        const quizzes = response.data.quizzes || [];
        const today = new Date();
        
        // Get upcoming quizzes (available and not taken)
        const upcomingQuizzes = quizzes
          .filter(q => q.status !== 'Passed' && q.status !== 'Failed' && new Date(q.startDate) >= today)
          .slice(0, 3)
          .map(q => ({
            id: q.id,
            title: q.title,
            course: q.courseName || "Course",
            due: new Date(q.startDate).toLocaleDateString(),
            type: "Quiz"
          }));
        
        // Merge with assignment deadlines and sort by date
        const allDeadlines = [...upcomingDeadlines, ...upcomingQuizzes];
        allDeadlines.sort((a, b) => new Date(a.due) - new Date(b.due));
        setUpcomingDeadlines(allDeadlines.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  // Get overall grade color
  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'grade-excellent';
    if (grade === 'B') return 'grade-good';
    if (grade === 'C') return 'grade-average';
    if (grade === 'D') return 'grade-poor';
    if (grade === 'F') return 'grade-failing';
    return 'grade-default';
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      await handleGetProfile();
      await handleGetEnrolledCourses();
      await handleGetAssignments();
      await handleGetAnnouncements();
      await handleGetQuizResults();
      await handleGetUpcomingQuizzes();
      await handleGetAssignmentResults();
      setIsLoading(false);
    };
    
    fetchAllData();
  }, []);

  if (isLoading) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-container">
        
        {/* Page Header with Welcome Banner */}
        <div className="welcome-banner mb-4">
          <div className="welcome-content">
            <div>
              <h1 className="welcome-title">Welcome back! {userName}👋</h1>
              <p className="welcome-subtitle">Here's your academic summary and pending tasks for today.</p>
            </div>
            <div className="welcome-emoji">📚</div>
          </div>
        </div>

        {/* Row 1: Overview Statistics Cards */}
        <div className="stats-grid mb-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">📖</div>
            <div className="stat-info">
              <p className="stat-label">Enrolled Courses</p>
              <h3 className="stat-value">{stats.enrolledCourses}</h3>
            </div>
          </div>
          
          <div className="stat-card stat-card-danger">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <p className="stat-label">Pending Assignments</p>
              <h3 className="stat-value">{stats.pendingAssignments}</h3>
            </div>
          </div>
          
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">📢</div>
            <div className="stat-info">
              <p className="stat-label">New Announcements</p>
              <h3 className="stat-value">{stats.unreadAnnouncements}</h3>
            </div>
          </div>
          
          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <p className="stat-label">Overall Grade</p>
              <h3 className={`stat-value ${getGradeColor(stats.overallGrade)}`}>
                {stats.overallGrade}
              </h3>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="dashboard-grid">
          
          {/* Left Column: Courses & Performance */}
          <div className="grid-col-8">
            
            {/* Enrolled Courses Section */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h3 className="section-title">My Enrolled Courses</h3>
                  <p className="section-subtitle">Access your course materials and resources</p>
                </div>
                <Link to="/student/courses" className="btn-outline-custom">
                  View All Courses →
                </Link>
              </div>
              {myCourses.length === 0 ? (
                <div className="empty-courses">
                  <p>You haven't enrolled in any courses yet.</p>
                  <Link to="/student/courses" className="btn-enroll-now">
                    Browse Available Courses
                  </Link>
                </div>
              ) : (
                <div className="courses-grid">
                  {myCourses.slice(0, 3).map(course => (
                    <div className="course-card" key={course.id}>
                      <div className="course-icon">📘</div>
                      <h4 className="course-title">{course.courseName}</h4>
                      <p className="course-code">{course.courseCode}</p>
                      <p className="course-instructor">{course.instructor}</p>
                      {/* <Link 
                        to={`/student/courses/${course.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-course-link"
                      >
                        Open Course →
                      </Link> */}
                    </div>
                  ))}
                </div>
              )}
              {myCourses.length > 3 && (
                <div className="view-more">
                  <Link to="/student/courses">+{myCourses.length - 3} more courses</Link>
                </div>
              )}
            </div>

            {/* Performance Analytics Section */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h3 className="section-title">My Performance</h3>
                  <p className="section-subtitle">Track your academic progress</p>
                </div>
              </div>
              <div className="performance-stats">
                <div className="perf-stat">
                  <div className="perf-stat-icon">📋</div>
                  <div className="perf-stat-info">
                    <span className="perf-stat-label">Quizzes Taken</span>
                    <span className="perf-stat-value">{quizStats.totalQuizzes}</span>
                  </div>
                </div>
                <div className="perf-stat">
                  <div className="perf-stat-icon">📊</div>
                  <div className="perf-stat-info">
                    <span className="perf-stat-label">Average Quiz Score</span>
                    <span className="perf-stat-value">{quizStats.averageScore}%</span>
                  </div>
                </div>
                <div className="perf-stat">
                  <div className="perf-stat-icon">📝</div>
                  <div className="perf-stat-info">
                    <span className="perf-stat-label">Assignments</span>
                    <span className="perf-stat-value">{assignmentStats.submitted}/{assignmentStats.total}</span>
                  </div>
                </div>
                <div className="perf-stat">
                  <div className="perf-stat-icon">✅</div>
                  <div className="perf-stat-info">
                    <span className="perf-stat-label">Completion Rate</span>
                    <span className="perf-stat-value">
                      {assignmentStats.total > 0 
                        ? Math.round((assignmentStats.submitted / assignmentStats.total) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Alerts & Announcements */}
          <div className="grid-col-4">
            
            {/* Action Required: Upcoming Deadlines */}
            <div className="section-card deadline-card">
              <div className="section-header">
                <div>
                  <h3 className="section-title text-danger">⚠️ Action Required</h3>
                  <p className="section-subtitle">Upcoming deadlines you need to meet</p>
                </div>
              </div>
              {upcomingDeadlines.length === 0 ? (
                <div className="no-deadlines">
                  <p>🎉 No upcoming deadlines! Great job!</p>
                </div>
              ) : (
                <div className="deadlines-list">
                  {upcomingDeadlines.map(task => (
                    <div className="deadline-item" key={task.id}>
                      <div className="deadline-info">
                        <div className="deadline-header">
                          <span className="deadline-title">{task.title}</span>
                          <span className={`deadline-badge ${task.type === 'Quiz' ? 'badge-quiz' : 'badge-assignment'}`}>
                            {task.type}
                          </span>
                        </div>
                        <p className="deadline-course">{task.course}</p>
                        <p className="deadline-date">Due: {task.due}</p>
                      </div>
                      <Link to={`/student/${task.type.toLowerCase()}s`} className="btn-deadline-link">
                        Go to task →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Announcements */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h3 className="section-title">📢 Recent Announcements</h3>
                  <p className="section-subtitle">Stay updated with latest news</p>
                </div>
                <Link to="/student/announcements" className="link-custom">See all →</Link>
              </div>
              {recentAnnouncements.length === 0 ? (
                <div className="no-announcements">
                  <p>No announcements yet.</p>
                </div>
              ) : (
                <div className="announcements-list">
                  {recentAnnouncements.map(ann => (
                    <div className={`announcement-item ${!ann.isRead ? 'unread' : ''}`} key={ann.id}>
                      <p className="announcement-text">{ann.text}</p>
                      <span className="announcement-date">{ann.date}</span>
                      {!ann.isRead && <span className="new-badge">New</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;