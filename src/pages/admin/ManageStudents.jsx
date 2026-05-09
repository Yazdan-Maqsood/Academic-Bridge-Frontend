import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./manageStudents.css";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState();
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    rollNumber: "",
    studentName: "",
    studentEmail: "",
    status: "",
    department: "",
  });

  const [editFormData, setEditFormData] = useState({
    rollNumber: "",
    studentName: "",
    studentEmail: "",
    status: "", 
    department: "",
  });

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setErrorMsg("");  
    try {
      setIsLoading(true);

      const response = await axios.post(`${API_URL}/admin/add-student`, formData, {
        withCredentials: true 
      });

      if (response.status === 201) {
        setStudents((prev) => [...prev, response.data.student]);
        setShowAddModal(false);
        setFormData({
          rollNumber: "",
          studentName: "",
          studentEmail: "",
          status: "",
          department: "",
        });
        alert("Student added successfully!");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setErrorMsg("Student already exists");
      } else {
        setErrorMsg(error.response?.data?.message || "Failed to add student");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleGetStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/get-students`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      if (response.status === 200) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.log(`Something went wrong! ${error}`);
    }
  };

  const handleOpenEditModal = (student) => {
    setEditFormData({
      rollNumber: student.rollNumber,
      studentName: student.studentName,
      studentEmail: student.studentEmail,
      enroll_courses: student.enroll_courses,
      department: student.department,
      status: student.status,
    });
    setEditingId(student.id); 
    setShowEditModal(true);
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/admin/edit-student/${editingId}`, editFormData, {
        withCredentials: true,
      });
      
      if (response.status === 200) {
        setStudents(students.map(student => 
          student.id === editingId ? response.data.student : student
        ));
        setShowEditModal(false);
        setEditFormData({ rollNumber: "", studentName: "", studentEmail: "", status: "", enroll_courses: "", department: "" });
        setEditingId(null);
        alert("Student updated successfully!");
      }
    } catch (error) {
      console.log(`Something went wrong: ${error.message}`);
      if (error.response?.status === 409) {
        setErrorMsg("Student with this email or roll number already exists");
      } else {
        setErrorMsg(error.response?.data?.message || "Failed to update student");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (student_id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.delete(`${API_URL}/admin/delete-student/${student_id}`, {
        headers: {
          "Content-Type": "application/json",
        }, 
        withCredentials: true,
      });
  
      if (response.status === 200) {
        setStudents(prev => prev.filter(std => std.id !== student_id));
        alert("Student deleted successfully!");
      }
    } catch (error) {
      console.log(`Something went wrong: ${error.message}`);
      alert(error.response?.data?.message || "Failed to delete student");
    } finally {
      setIsLoading(false);
    }
  };
  
  const capitalize = (word) => {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    handleGetStudents();
  }, []);

  return (
    <div className="manage-students">
      <div className="students-container">
        
        {/* Header Section with Gradient Banner */}
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">Manage Students 👨‍🎓</h1>
              <p className="header-subtitle">View, add, and manage student accounts in the portal.</p>
            </div>
            <button 
              className="btn-add-student"
              onClick={() => setShowAddModal(true)}
            >
              <span className="btn-icon">➕</span>
              Add New Student
            </button>
          </div>
        </div>

        {/* Student List Table Card */}
        <div className="students-card">
          <div className="card-header-custom">
            <div>
              <h3 className="card-title">Student Records</h3>
              <p className="card-subtitle">Showing {filteredStudents.length} of {students.length} students</p>
            </div>
            <div className="header-actions">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search students by roll number, name or email..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th className="col-roll">Roll Number</th>
                  <th className="col-name">Student Name</th>
                  <th className="col-email">Email Address</th>
                  <th className="col-department">Department</th>
                  <th className="col-courses">Enrolled Courses</th>
                  <th className="col-status">Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="roll-number">{student.rollNumber}</td>
                    <td className="student-name">
                      <div className="student-info">
                        <div className="student-avatar">
                          {student.studentName?.charAt(0) || 'S'}
                        </div>
                        <span>{capitalize(student.studentName)}</span>
                      </div>
                    </td>
                    <td className="student-email">{student.studentEmail}</td>
                    <td className="student-department">{student.department}</td>
                    <td className="courses-count">
                      <span className="count-badge">{student.enroll_courses || 0}</span>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge status-${student.status?.toLowerCase() || 'active'}`}>
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="action-badge action-badge-edit" 
                        title="Edit Student" 
                        onClick={() => handleOpenEditModal(student)}
                      >
                        Edit
                      </button>
                      <button 
                        className="action-badge action-badge-delete" 
                        title="Delete Student" 
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr className="empty-state">
                    <td colSpan="6">
                      <div className="empty-state-content">
                        <div className="empty-icon">📚</div>
                        <p className="empty-text">
                          {searchTerm ? "No matching students found" : "No students found"}
                        </p>
                        <p className="empty-subtext">
                          {searchTerm 
                            ? `No students match "${searchTerm}"` 
                            : 'Click the "Add New Student" button to get started.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Add New Student</h3>
                  <p className="modal-subtitle">Create a new student account in the system</p>
                </div>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                <form onSubmit={handleAddStudent}>
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">🎓</span>
                      Roll Number
                    </label>
                    <input 
                      type="text" 
                      className="form-input"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., BCS-004" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">👤</span>
                      Student Name
                    </label>
                    <input 
                      type="text"
                      name="studentName"
                      className="form-input"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      placeholder="e.g., John Doe"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📧</span>
                      Email Address
                    </label>
                    <input 
                      type="email"
                      name="studentEmail"
                      className="form-input"
                      value={formData.studentEmail}
                      onChange={handleInputChange}
                      placeholder="student@example.com"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
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
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      className="form-input"
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Choose Status</option>
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Account"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-custom">
                <div>
                  <h3 className="modal-title">Edit Student</h3>
                  <p className="modal-subtitle">Update student account information</p>
                </div>
                <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
              </div>
              
              <div className="modal-body-custom">
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                <form onSubmit={handleEditStudent}>
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">🎓</span>
                      Roll Number
                    </label>
                    <input 
                      type="text" 
                      className="form-input"
                      name="rollNumber"
                      value={editFormData.rollNumber}
                      onChange={handleEditInputChange}
                      placeholder="e.g., BCS-004" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">👤</span>
                      Student Name
                    </label>
                    <input 
                      type="text"
                      name="studentName"
                      className="form-input"
                      value={editFormData.studentName}
                      onChange={handleEditInputChange}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📧</span>
                      Email Address
                    </label>
                    <input 
                      type="email"
                      name="studentEmail"
                      className="form-input"
                      value={editFormData.studentEmail}
                      onChange={handleEditInputChange}
                      required 
                    />
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
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      value={editFormData.status}
                      className="form-input"
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Student"}
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

export default ManageStudents;