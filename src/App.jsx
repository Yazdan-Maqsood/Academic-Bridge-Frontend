import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./auth/ProtectedRoute"; 
import Home from "./pages/Home";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageCourses from "./pages/admin/ManageCourses";
import ManageAssignments from "./pages/admin/ManageAssignments";
import ManageQuizzes from "./pages/admin/ManageQuizzes";
import ManageResults from "./pages/admin/ManageResults";
import ManageAnnouncements from "./pages/admin/ManageAnnouncements";
import AdminProfile from "./pages/admin/AdminProfile";
import StudentCourses from "./pages/student/StudentCourses";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentQuizzes from "./pages/student/StudentQuizzes";
import StudentResults from "./pages/student/StudentResults";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";
import StudentProfile from "./pages/student/StudentProfile";
import "./App.css"

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />

      <Routes>
        {/* PUBLIC ROUTES - No authentication needed */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* HOME - Accessible to both roles after login */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />

        {/* ADMIN ROUTES - Only admin can access */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage-students" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageStudents />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage-courses" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageCourses />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage-assignments" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageAssignments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage-quizzes" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageQuizzes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage-results" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageResults />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage-announcements" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageAnnouncements />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/profile" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminProfile />
            </ProtectedRoute>
          } 
        />

        {/* STUDENT ROUTES - Only student can access */}
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/courses" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentCourses />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/assignments" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAssignments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/quizzes" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentQuizzes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/results" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentResults />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/announcements" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAnnouncements />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/profile" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentProfile />
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      <Footer />
    </div>
  );
}

export default App;