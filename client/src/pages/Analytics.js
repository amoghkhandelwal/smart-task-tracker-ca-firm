import React, { useEffect, useState, useRef, useContext } from 'react';
import AppNavbar from '../components/Layout/Navbar';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement } from 'chart.js';
import { FaStar, FaFire, FaExclamationTriangle, FaFilePdf, FaRedo, FaCheck, FaEdit, FaTrash, FaUndo } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import TaskForm from '../components/Dashboard/TaskForm';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

function getDateString(date) {
  return date.toISOString().slice(0, 10);
}
function getWeekString(date) {
  // Returns 'YYYY-WW' (ISO week)
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + 4 - (d.getDay()||7));
  const yearStart = new Date(d.getFullYear(),0,1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  return `${d.getFullYear()}-W${weekNo.toString().padStart(2,'0')}`;
}
function getMonthString(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
}

const CATEGORY_COLORS = [
  '#43cea2', '#185a9d', '#f7971e', '#ff6f61', '#6c63ff', '#ffd200', '#00b894', '#a18cd1', '#fbc2eb', '#fad0c4'
];

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const analyticsRef = useRef();
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingTab, setPendingTab] = useState('all'); // 'all', 'admin', 'self', 'allUsers', 'user'
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [usersUnderAdmin, setUsersUnderAdmin] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL;
        const res = await axios.get(`${API_BASE_URL}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setTasks(res.data.filter(t => !t.deletedAt));
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    // Fetch users under admin if admin
    if (user && user.role === 'admin') {
      const fetchUsers = async () => {
        try {
          const API_BASE_URL = process.env.REACT_APP_API_URL;
          const res = await axios.get(`${API_BASE_URL}/api/auth/users-under-admin`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            params: { adminId: user.userId }
          });
          setUsersUnderAdmin(res.data.users || []);
        } catch (err) {
          setUsersUnderAdmin([]);
        }
      };
      fetchUsers();
    }
  }, [user]);

  // --- Productivity Score (new formula) ---
  const completed = tasks.filter(t => t.isCompleted).length;
  const overdue = tasks.filter(t => t.dueDate && !t.isCompleted && new Date(t.dueDate) < new Date()).length;

  // All tasks due today
  const todayStr = new Date().toISOString().slice(0, 10);
  const dueToday = tasks.filter(t => t.dueDate && t.dueDate.slice(0, 10) === todayStr);
  const completedToday = dueToday.filter(t => t.isCompleted).length;
  const allTodayCompleted = dueToday.length > 0 && completedToday === dueToday.length;

  // 3-day streak of full completion
  let fullStreak = 0;
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const due = tasks.filter(t => t.dueDate && t.dueDate.slice(0, 10) === dStr);
    const done = due.filter(t => t.isCompleted).length;
    if (due.length === 0 || done !== due.length) break;
    fullStreak++;
  }
  const has3DayFullStreak = fullStreak === 3;

  let score = 50;
  score += completed * 5;
  score -= overdue * 5;
  if (allTodayCompleted) score += 10;
  if (has3DayFullStreak) score += 10;
  score = Math.max(0, Math.min(100, score));

  let badge = { label: 'Needs Improvement', color: 'danger', icon: <FaExclamationTriangle /> };
  if (score >= 80) badge = { label: 'Excellent', color: 'success', icon: <FaStar /> };
  else if (score >= 40) badge = { label: 'Good', color: 'warning', icon: <FaFire /> };

  // Aggregate completed tasks
  let labels = [];
  let completedCounts = [];
  if (view === 'daily') {
    const today = new Date();
    labels = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (13 - i));
      return getDateString(d);
    });
    completedCounts = labels.map(day =>
      tasks.filter(t => t.isCompleted && t.completedAt && getDateString(new Date(t.completedAt)) === day).length
    );
  } else if (view === 'weekly') {
    const today = new Date();
    labels = Array.from({ length: 8 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (7 * (7 - i)));
      return getWeekString(d);
    });
    completedCounts = labels.map(week =>
      tasks.filter(t => t.isCompleted && t.completedAt && getWeekString(new Date(t.completedAt)) === week).length
    );
  } else if (view === 'monthly') {
    const today = new Date();
    labels = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(today);
      d.setMonth(today.getMonth() - (11 - i));
      return getMonthString(d);
    });
    completedCounts = labels.map(month =>
      tasks.filter(t => t.isCompleted && t.completedAt && getMonthString(new Date(t.completedAt)) === month).length
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Tasks Completed',
        data: completedCounts,
        backgroundColor: '#43cea2',
        borderRadius: 6,
      },
    ],
  };

  const maxY = Math.max(8, Math.max(...completedCounts));

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { color: 'rgba(200,200,200,0.1)' },
        ticks: { color: '#888' },
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: maxY,
        grid: { color: 'rgba(200,200,200,0.1)' },
        ticks: { color: '#888', stepSize: 1 },
      },
    },
  };

  // --- Category Breakdown Pie Chart ---
  const categoryCounts = {};
  tasks.forEach(t => {
    if (t.category) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }
  });
  const categoryLabels = Object.keys(categoryCounts);
  const categoryData = Object.values(categoryCounts);
  const pieColors = categoryLabels.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]);

  const pieData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryData,
        backgroundColor: pieColors,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: { display: true, position: 'bottom' },
      tooltip: { enabled: true },
    },
    maintainAspectRatio: false,
  };

  // --- Export as PDF ---
  const handleExportPDF = async () => {
    if (!analyticsRef.current) return;
    const canvas = await html2canvas(analyticsRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    pdf.save('analytics-report.pdf');
  };

  const handleMarkComplete = async (task) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      // Dual-completion logic (same as Dashboard)
      const isAdminAssigned = !!task.assignedBy;
      const isAssignee = user && user.userId == (task.assignedTo && task.assignedTo.toString());
      const isAdmin = user && user.userId == (task.user && task.user.toString());
      let update = {};
      if (isAdminAssigned) {
        if (isAssignee) {
          update = { userCompleted: true };
        } else if (isAdmin) {
          update = { adminCompleted: true, isCompleted: task.userCompleted };
        }
      } else {
        update = { isCompleted: true };
      }
      await axios.put(`${API_BASE_URL}/api/tasks/${task._id}`, update, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, ...update } : t));
    } catch (err) {
      alert('Failed to mark complete');
    }
  };

  const handleMarkIncomplete = async (task) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      await axios.put(`${API_BASE_URL}/api/tasks/${task._id}`, { isCompleted: false, completedAt: null }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, isCompleted: false, completedAt: null } : t));
    } catch (err) {
      alert('Failed to mark as incomplete');
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      await axios.delete(`${API_BASE_URL}/api/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(prev => prev.filter(t => t._id !== task._id));
      if (editingTask && editingTask._id === task._id) {
        setShowEditModal(false);
        setEditingTask(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleUpdateTask = async (updatedTask) => {
    if (!updatedTask) {
      setShowEditModal(false);
      setEditingTask(null);
      return;
    }
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      const res = await axios.put(`${API_BASE_URL}/api/tasks/${updatedTask._id}`, updatedTask, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? res.data : t));
      setShowEditModal(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update task');
    }
  };

  // Pending tasks filter logic
  let filteredPendingTasks = tasks.filter(t => !t.isCompleted);
  if (user) {
    if (user.role === 'user') {
      if (pendingTab === 'admin') {
        filteredPendingTasks = filteredPendingTasks.filter(t => t.assignedBy);
      } else if (pendingTab === 'self') {
        filteredPendingTasks = filteredPendingTasks.filter(t => !t.assignedBy);
      }
    } else if (user.role === 'admin') {
      if (pendingTab === 'self') {
        filteredPendingTasks = filteredPendingTasks.filter(t => t.assignedTo === user.userId);
      } else if (pendingTab === 'allUsers' && selectedUserId !== 'all') {
        filteredPendingTasks = filteredPendingTasks.filter(t => t.assignedTo === selectedUserId);
      } else if (pendingTab === 'waitingApproval') {
        filteredPendingTasks = tasks.filter(
          t => t.assignedBy === user.userId && t.userCompleted && !t.adminCompleted && !t.deletedAt
        );
      }
    }
  }

  return (
    <>
      <AppNavbar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex gap-2 align-items-center">
            <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
          </div>
          <button className="btn btn-outline-danger" onClick={handleExportPDF} title="Export as PDF">
            <FaFilePdf className="me-2" /> Export as PDF
          </button>
        </div>
        <div ref={analyticsRef}>
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm p-3 mb-3">
                <h5 className="mb-3">Recurring Tasks</h5>
                {tasks.filter(t => t.recurrenceType && t.recurrenceType !== 'none').length === 0 ? (
                  <div className="text-muted">No recurring tasks.</div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {tasks.filter(t => t.recurrenceType && t.recurrenceType !== 'none').map(t => (
                      <li key={t._id} className="list-group-item d-flex flex-column align-items-start">
                        <span className="fw-bold">{t.title}</span>
                        <span className="small text-muted">Recurs: {t.recurrenceType === 'daily' ? 'Daily' : t.recurrenceType === 'weekly' ? 'Weekly' : t.recurrenceType === 'monthly' ? 'Monthly' : `Every ${t.recurrenceInterval} days`}</span>
                        <span className="small">Next Due: {t.dueDate ? t.dueDate.slice(0,10) : 'N/A'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm p-3 mb-3">
                <h5 className="mb-3">Completed Tasks</h5>
                {tasks.filter(t => t.isCompleted).length === 0 ? (
                  <div className="text-muted">No completed tasks.</div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {tasks.filter(t => t.isCompleted).map(t => {
                      // Permission logic (same as TaskList.js)
                      const isAdminAssigned = !!t.assignedBy;
                      const isAssignee = user && user.userId == (t.assignedTo && t.assignedTo.toString());
                      const isAdmin = user && user.userId == (t.user && t.user.toString());
                      // Edit: Only admin (creator) can edit
                      const canEdit = isAdmin;
                      // Delete: Admin can always delete; user can delete only if both have completed (for admin-assigned), or if it's their own task
                      const canDelete = (isAdminAssigned && isAdmin) || (isAssignee && isAdminAssigned && t.userCompleted && t.adminCompleted) || (isAssignee && !isAdminAssigned);
                      return (
                        <li key={t._id} className="list-group-item d-flex flex-column align-items-start">
                          <span className="fw-bold">
                            {t.title}
                            {t.recurrenceType && t.recurrenceType !== 'none' && (
                              <span className="badge bg-info ms-2"><FaRedo className="me-1" style={{fontSize:'0.9em'}}/> Recurring</span>
                            )}
                          </span>
                          <span className="small text-muted">Due: {t.dueDate ? t.dueDate.slice(0,10) : 'N/A'}</span>
                          <span className="small">Completed: {t.completedAt ? new Date(t.completedAt).toLocaleString() : 'N/A'}</span>
                          <div className="d-flex gap-2 mt-2 align-self-end">
                            <button
                              className="btn btn-sm btn-outline-warning"
                              title="Mark as Incomplete"
                              onClick={() => handleMarkIncomplete(t)}
                            >
                              <FaUndo className="me-1" /> Undo
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Task"
                              onClick={() => handleDeleteTask(t)}
                              disabled={!canDelete}
                            >
                              <FaTrash className="me-1" /> Delete
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm p-3 mb-3">
                <h5 className="mb-3">Pending Tasks</h5>
                {/* Tabs for filtering */}
                {user && user.role === 'user' && (
                  <div className="mb-2 d-flex gap-2">
                    <button className={`btn btn-sm ${pendingTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPendingTab('all')}>All</button>
                    <button className={`btn btn-sm ${pendingTab === 'admin' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPendingTab('admin')}>Admin-assigned</button>
                    <button className={`btn btn-sm ${pendingTab === 'self' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPendingTab('self')}>Self-assigned</button>
                  </div>
                )}
                {user && user.role === 'admin' && (
                  <div className="mb-2 d-flex gap-2 align-items-center">
                    <button className={`btn btn-sm ${pendingTab === 'self' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPendingTab('self')}>Self</button>
                    <button className={`btn btn-sm ${pendingTab === 'allUsers' || pendingTab === 'user' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPendingTab('allUsers')}>All Users</button>
                    <button className={`btn btn-sm ${pendingTab === 'waitingApproval' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPendingTab('waitingApproval')}>Waiting for Approval</button>
                    {pendingTab === 'allUsers' && usersUnderAdmin.length > 0 && (
                      <select className="form-select form-select-sm ms-2" style={{ width: 180 }} value={selectedUserId} onChange={e => {
                        setSelectedUserId(e.target.value);
                        setPendingTab('user');
                      }}>
                        <option value="all">All</option>
                        {usersUnderAdmin.map(u => (
                          <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
                {/* Pending tasks list */}
                {filteredPendingTasks.length === 0 ? (
                  <div className="text-muted">No pending tasks.</div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {filteredPendingTasks.map(t => {
                      let isOverdue = false;
                      if (t.dueDate) {
                        const due = new Date(t.dueDate);
                        const now = new Date();
                        isOverdue = due < now;
                      }
                      // Permission logic (same as TaskList.js)
                      const isAdminAssigned = !!t.assignedBy;
                      const isAssignee = user && user.userId == (t.assignedTo && t.assignedTo.toString());
                      const isAdmin = user && user.userId == (t.user && t.user.toString());
                      // Edit: Only admin (creator) can edit
                      const canEdit = isAdmin;
                      // Delete: Admin can always delete; user can delete only if both have completed (for admin-assigned), or if it's their own task
                      const canDelete = (isAdminAssigned && isAdmin) || (isAssignee && isAdminAssigned && t.userCompleted && t.adminCompleted) || (isAssignee && !isAdminAssigned);
                      return (
                        <li key={t._id} className="list-group-item d-flex flex-column align-items-start">
                          <div className="d-flex w-100 justify-content-between align-items-center">
                            <span className="fw-bold">
                              {t.title}
                              {t.assignedBy && (
                                <span className="badge bg-primary ms-2" title="Assigned by Admin">A</span>
                              )}
                              {t.recurrenceType && t.recurrenceType !== 'none' && (
                                <span className="badge bg-info ms-2"><FaRedo className="me-1" style={{fontSize:'0.9em'}}/> Recurring</span>
                              )}
                              {isOverdue && (
                                <span className="badge bg-danger ms-2">Overdue</span>
                              )}
                            </span>
                            <span className="d-flex gap-2">
                              <button className="btn btn-sm btn-outline-success" title="Mark Complete" onClick={() => handleMarkComplete(t)}><FaCheck /></button>
                              <button className="btn btn-sm btn-outline-primary" title="Edit" onClick={() => handleEditTask(t)} disabled={!canEdit}><FaEdit /></button>
                              <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDeleteTask(t)} disabled={!canDelete}><FaTrash /></button>
                            </span>
                          </div>
                          <span className="small text-muted">Due: {t.dueDate ? t.dueDate.slice(0,10) : 'N/A'}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="card p-4 shadow-sm mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Tasks Completed ({view.charAt(0).toUpperCase() + view.slice(1)})</h4>
              <select
                className="form-select w-auto"
                value={view}
                onChange={e => setView(e.target.value)}
              >
                <option value="daily">Daily (Last 14 Days)</option>
                <option value="weekly">Weekly (Last 8 Weeks)</option>
                <option value="monthly">Monthly (Last 12 Months)</option>
              </select>
            </div>
            <div style={{height: '320px'}}>
              {loading ? (
                <div className="text-center text-muted">Loading chart...</div>
              ) : (
                <Bar data={data} options={options} />
              )}
            </div>
          </div>
          <div className="card p-4 shadow-sm mb-4">
            <h4 className="mb-3">Tasks by Category</h4>
            <div style={{height: '320px'}}>
              {loading ? (
                <div className="text-center text-muted">Loading chart...</div>
              ) : categoryLabels.length === 0 ? (
                <div className="text-center text-muted">No tasks to show.</div>
              ) : (
                <Pie data={pieData} options={pieOptions} />
              )}
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card text-center shadow-sm p-3">
                <h6 className="text-muted">Productivity Score</h6>
                <h2 className="fw-bold mb-2">{score}</h2>
                <span className={`badge bg-${badge.color} fs-6 px-3 py-2`}>{badge.icon} {badge.label}</span>
                <div className="mt-2 small text-muted">
                  Score = 50 + (Completed × 5) − (Overdue × 5)
                  <br />+10 if all due today completed<br />+10 for 3-day full completion streak<br />Max 100, Min 0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showEditModal && editingTask && (
        <div className="modal show d-block" tabIndex="-1" style={{background:'rgba(0,0,0,0.3)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Task</h5>
                <button type="button" className="btn-close" onClick={() => {setShowEditModal(false); setEditingTask(null);}}></button>
              </div>
              <div className="modal-body">
                <TaskForm editingTask={editingTask} onUpdate={handleUpdateTask} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Analytics; 