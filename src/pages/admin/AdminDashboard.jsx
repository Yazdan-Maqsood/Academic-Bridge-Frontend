import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./adminDashboard.css";
import API_URL from "../../constants/api_url";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    pendingSubmissions: 0,
    recentAnnouncements: 0,
    totalQuizzes: 0,
    totalAssignments: 0,
  });
  
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [pendingGrades, setPendingGrades] = useState(0);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const studentsRes = await axios.get(`${API_URL}/admin/get-students`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      const coursesRes = await axios.get(`${API_URL}/admin/get-courses`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      const assignmentsRes = await axios.get(`${API_URL}/admin/get-assignments`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      const pendingRes = await axios.get(`${API_URL}/admin/get-pending-submissions`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      const announcementsRes = await axios.get(`${API_URL}/admin/get-announcements`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      const quizzesRes = await axios.get(`${API_URL}/admin/get-quizzes`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      const totalStudents = studentsRes.data.students?.length || 0;
      const activeCourses = coursesRes.data.courses?.filter(c => c.status === 'Active').length || 0;
      const pendingSubmissions = pendingRes.data.submissions?.length || 0;
      const recentAnnouncements = announcementsRes.data.announcements?.length || 0;
      const totalQuizzes = quizzesRes.data.quizzes?.length || 0;
      const totalAssignments = assignmentsRes.data.assignments?.length || 0;
      
      setStats({
        totalStudents,
        activeCourses,
        pendingSubmissions,
        recentAnnouncements,
        totalQuizzes,
        totalAssignments,
      });
      
      setPendingGrades(pendingSubmissions);
      
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  // Fetch recent submissions
  const fetchRecentSubmissions = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/get-pending-submissions`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        const submissions = response.data.submissions || [];
        const formatted = submissions.slice(0, 5).map(sub => ({
          id: sub.id,
          student: sub.studentName,
          course: sub.assignmentTitle || "Assignment",
          date: new Date(sub.submittedAt).toLocaleDateString(),
        }));
        setRecentSubmissions(formatted);
      }
    } catch (error) {
      console.log(`Something went wrong: ${error}`);
    }
  };

  // Fetch recent students
  const fetchRecentStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/get-students`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      if (response.status === 200) {
        const students = response.data.students || [];
        const recent = students.slice(-5).reverse().map(student => ({
          id: student.id,
          name: student.studentName,
          email: student.studentEmail,
          enrolledAt: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "Recently",
        }));
        setRecentStudents(recent);
      }
    } catch (error) {
      console.log(`Something went wrong: ${error}`);
    }
  };

  // Generate system alerts
  const generateSystemAlerts = () => {
    const alerts = [];
    
    if (stats.pendingSubmissions > 0) {
      alerts.push({
        id: 1,
        type: "danger",
        icon: "⏰",
        title: `${stats.pendingSubmissions} Pending Submissions`,
        message: `${stats.pendingSubmissions} assignment(s) waiting for grading`,
        link: "/admin/manage-results",
      });
    }
    
    const checkUpcomingDeadlines = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/get-assignments`, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        
        const assignments = response.data.assignments || [];
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const upcomingAssignments = assignments.filter(a => {
          const dueDate = new Date(a.dueDate);
          return dueDate >= today && dueDate <= nextWeek;
        });
        
        if (upcomingAssignments.length > 0) {
          alerts.push({
            id: 2,
            type: "warning",
            icon: "📝",
            title: `${upcomingAssignments.length} Assignments Due Soon`,
            message: `Deadlines approaching within the next 7 days`,
            link: "/admin/manage-assignments",
          });
        }
      } catch (error) {
        console.error("Error checking deadlines:", error);
      }
    };
    
    checkUpcomingDeadlines();
    
    alerts.push({
      id: 3,
      type: "info",
      icon: "🔧",
      title: "System Health",
      message: "All systems operational",
      link: null,
    });
    
    setSystemAlerts(alerts);
  };

  // Fetch all dashboard data
  const fetchAllData = async () => {
    setIsLoading(true);
    await fetchDashboardStats();
    await fetchRecentSubmissions();
    await fetchRecentStudents();
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (stats.pendingSubmissions > 0) {
      generateSystemAlerts();
    }
  }, [stats.pendingSubmissions]);

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        
        {/* Welcome Banner */}
        <div className="welcome-banner-admin mb-4">
          <div className="welcome-content">
            <div>
              <h1 className="welcome-title">Admin Dashboard 👨‍💼</h1>
              <p className="welcome-subtitle">Welcome back! Here's what's happening in the portal today.</p>
            </div>
            <div className="welcome-emoji">⚙️</div>
          </div>
        </div>

        {/* Row 1: Overview Statistics Cards - 4 columns */}
        <div className="stats-row">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <p className="stat-label">Total Students</p>
              <h3 className="stat-value">{stats.totalStudents}</h3>
            </div>
          </div>
          
          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <p className="stat-label">Active Courses</p>
              <h3 className="stat-value">{stats.activeCourses}</h3>
            </div>
          </div>
          
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <p className="stat-label">Pending Submissions</p>
              <h3 className="stat-value">{stats.pendingSubmissions}</h3>
            </div>
          </div>
          
          <div className="stat-card stat-card-info">
            <div className="stat-icon">📢</div>
            <div className="stat-info">
              <p className="stat-label">Announcements</p>
              <h3 className="stat-value">{stats.recentAnnouncements}</h3>
            </div>
          </div>
        </div>

        {/* Row 2: Additional Statistics - 4 columns */}
        <div className="stats-row mb-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <p className="stat-label">Total Quizzes</p>
              <h3 className="stat-value">{stats.totalQuizzes}</h3>
            </div>
          </div>
          
          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <p className="stat-label">Assignments</p>
              <h3 className="stat-value">{stats.totalAssignments}</h3>
            </div>
          </div>
          
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <p className="stat-label">Needs Grading</p>
              <h3 className="stat-value">{pendingGrades}</h3>
            </div>
          </div>
          
          <div className="stat-card stat-card-info">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <p className="stat-label">Completion Rate</p>
              <h3 className="stat-value">
                {stats.totalAssignments > 0 
                  ? Math.round(((stats.totalAssignments - stats.pendingSubmissions) / stats.totalAssignments) * 100) 
                  : 0}%
              </h3>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
   
<div className="quick-actions-card mb-4">
  <div className="section-header">
    <div>
      <h3 className="section-title">Quick Actions</h3>
      <p className="section-subtitle">Manage your portal with one click</p>
    </div>
  </div>
  <div className="actions-grid">
    <button className="action-btn action-btn-primary" style={{width: '100%', padding: '25px 0'}}>
      <Link to="/admin/manage-students" style={{textDecoration: 'none', color: 'white'}}>
        <span className="action-icon">➕</span>
        <span>Add Student</span>
      </Link>
    </button>
    <button className="action-btn action-btn-secondary" style={{width: '100%', padding: '25px 0'}}>
      <Link to="/admin/manage-courses" style={{textDecoration: 'none', color: 'white'}}>
        <span className="action-icon">📘</span>
        <span>Create Course</span>
      </Link>
    </button>
    <button className="action-btn action-btn-warning" style={{width: '100%', padding: '25px 0'}}>
      <Link to="/admin/manage-assignments" style={{textDecoration: 'none', color: 'white'}}>
        <span className="action-icon">📝</span>
        <span>Upload Assignment</span>
      </Link>
    </button>
    <button className="action-btn action-btn-info" style={{width: '100%', padding: '25px 0'}}>
      <Link to="/admin/manage-announcements" style={{textDecoration: 'none', color: 'white'}}>
        <span className="action-icon">📢</span>
        <span>Post Announcement</span>
      </Link>
    </button>
  </div>
</div>  

        {/* Two Column Layout */}
        <div className="two-column-layout">
          
          {/* Left Column */}
          <div className="left-column">
            {/* Recent Submissions */}
            <div className="submissions-card">
              <div className="section-header">
                <div>
                  <h3 className="section-title">Recent Submissions</h3>
                  <p className="section-subtitle">Assignments pending review</p>
                </div>
                <Link to="/admin/manage-results" className="btn-outline-custom">View All →</Link>
              </div>
              <div className="table-responsive-custom">
                {recentSubmissions.length === 0 ? (
                  <div className="empty-state-inline">
                    <p>No pending submissions. Great job! 🎉</p>
                  </div>
                ) : (
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Assignment</th>
                        <th>Submitted On</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSubmissions.map((sub) => (
                        <tr key={sub.id}>
                          <td className="student-name">{sub.student}</td>
                          <td>{sub.course}</td>
                          <td className="submission-date">{sub.date}</td>
                          <td>
                            <Link to="/admin/manage-results" className="btn-grade">
                              Grade
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* System Alerts */}
            <div className="alerts-card mt-4">
              <div className="section-header">
                <h3 className="section-title">⚠️ System Alerts</h3>
                <p className="section-subtitle">Important deadlines & updates</p>
              </div>
              <div className="alerts-list">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className={`alert-item alert-${alert.type}`}>
                    <div className="alert-icon">{alert.icon}</div>
                    <div className="alert-content">
                      <div className="alert-title">{alert.title}</div>
                      <div className="alert-message">{alert.message}</div>
                    </div>
                    {alert.link && (
                      <Link to={alert.link} className="alert-link">View →</Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Recent Students */}
            <div className="students-card">
              <div className="section-header">
                <div>
                  <h3 className="section-title">👨‍🎓 Recent Students</h3>
                  <p className="section-subtitle">Newly enrolled students</p>
                </div>
                <Link to="/admin/manage-students" className="btn-outline-custom">View All →</Link>
              </div>
              <div className="students-list">
                {recentStudents.length === 0 ? (
                  <div className="empty-state-inline">
                    <p>No students yet.</p>
                  </div>
                ) : (
                  recentStudents.map((student) => (
                    <div className="student-item" key={student.id}>
                      <div className="student-avatar">
                        {student.name?.charAt(0) || 'S'}
                      </div>
                      <div className="student-info">
                        <div className="student-name">{student.name}</div>
                        <div className="student-email">{student.email}</div>
                      </div>
                      <div className="student-date">{student.enrolledAt}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats-card mt-4">
              <div className="section-header">
                <h3 className="section-title">📈 Quick Stats</h3>
                <p className="section-subtitle">Platform overview</p>
              </div>
              <div className="quick-stats">
                <div className="quick-stat-item">
                  <div className="quick-stat-icon">👥</div>
                  <div className="quick-stat-info">
                    <span className="quick-stat-label">Student/Course Ratio</span>
                    <span className="quick-stat-value">
                      {stats.activeCourses > 0 
                        ? (stats.totalStudents / stats.activeCourses).toFixed(1) 
                        : 0}
                    </span>
                  </div>
                </div>
                <div className="quick-stat-item">
                  <div className="quick-stat-icon">✅</div>
                  <div className="quick-stat-info">
                    <span className="quick-stat-label">Assignment Completion</span>
                    <span className="quick-stat-value">
                      {stats.totalAssignments > 0 
                        ? Math.round(((stats.totalAssignments - stats.pendingSubmissions) / stats.totalAssignments) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
                <div className="quick-stat-item">
                  <div className="quick-stat-icon">📊</div>
                  <div className="quick-stat-info">
                    <span className="quick-stat-label">Grading Progress</span>
                    <span className="quick-stat-value">
                      {stats.pendingSubmissions > 0 
                        ? Math.round(((stats.totalAssignments - stats.pendingSubmissions) / stats.totalAssignments) * 100) 
                        : 100}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;