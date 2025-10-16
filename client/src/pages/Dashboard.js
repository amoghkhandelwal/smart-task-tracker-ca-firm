import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AppNavbar from '../components/Layout/Navbar';
import TaskForm from '../components/Dashboard/TaskForm';
import TaskList from '../components/Dashboard/TaskList';
import TaskStats from '../components/Dashboard/TaskStats';
import TaskFilters from '../components/Dashboard/TaskFilters';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBullseye } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const CATEGORY_OPTIONS = ['Work', 'Personal', 'Health', 'Study', 'Other'];

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    priority: '',
    category: '',
    status: '',
    sortBy: '',
    search: '',
  });
  const [searchText, setSearchText] = useState('');
  const [toastShown, setToastShown] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [focusRange, setFocusRange] = useState('today'); // 'today' | 'week' | 'month'
  const [remindersShown, setRemindersShown] = useState([]);
  const [overdueRemindersShown, setOverdueRemindersShown] = useState([]);
  const [usersUnderAdmin, setUsersUnderAdmin] = useState([]);
  const [activeTabUserId, setActiveTabUserId] = useState(null);
  const [excelPreview, setExcelPreview] = useState([]);
  const [excelFileName, setExcelFileName] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch tasks from backend
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
        console.log('Fetched tasks:', res.data.map(t => ({ title: t.title, dueDate: t.dueDate, _id: t._id })));
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    if (user) fetchTasks();
  }, [user]);

  // Fetch users under the current admin if the user is an admin
  useEffect(() => {
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

  // Toast for overdue tasks
  useEffect(() => {
    if (tasks.length && !toastShown) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const overdue = tasks.filter(t => t.dueDate && !t.isCompleted && new Date(t.dueDate) < today);
      if (overdue.length > 0) {
        toast.warn(
          <div>
            <strong>Overdue Tasks:</strong>
            <ul className="mb-0 ps-3">
              {overdue.map(t => (
                <li key={t._id}>{t.title} <span className="text-danger">({t.dueDate.slice(0,10)})</span></li>
              ))}
            </ul>
          </div>,
          { autoClose: 8000 }
        );
        setToastShown(true);
      }
    }
  }, [tasks, toastShown]);

  // In-app reminders for tasks with reminderMinutesBefore
  useEffect(() => {
    if (!tasks.length) return;
    const now = new Date();
    const shownIds = new Set(remindersShown);
    tasks.forEach(task => {
      if (
        !task.isCompleted &&
        task.dueDate &&
        task.reminderMinutesBefore != null &&
        !shownIds.has(task._id)
      ) {
        const due = new Date(task.dueDate);
        const diffMins = (due - now) / (1000 * 60);
        if (diffMins <= task.reminderMinutesBefore && diffMins > 0) {
          toast.info(
            <div>
              <strong>Reminder:</strong> {task.title}<br/>
              Due at {due.toLocaleString()}<br/>
              ({task.reminderMinutesBefore} min left)
            </div>,
            { autoClose: 10000 }
          );
          setRemindersShown(prev => [...prev, task._id]);
        }
      }
    });
    // Set up interval to check every minute
    const interval = setInterval(() => {
      const now = new Date();
      setRemindersShown(prev => {
        const shown = new Set(prev);
        tasks.forEach(task => {
          if (
            !task.isCompleted &&
            task.dueDate &&
            task.reminderMinutesBefore != null &&
            !shown.has(task._id)
          ) {
            const due = new Date(task.dueDate);
            const diffMins = (due - now) / (1000 * 60);
            if (diffMins <= task.reminderMinutesBefore && diffMins > 0) {
              toast.info(
                <div>
                  <strong>Reminder:</strong> {task.title}<br/>
                  Due at {due.toLocaleString()}<br/>
                  ({task.reminderMinutesBefore} min left)
                </div>,
                { autoClose: 10000 }
              );
              shown.add(task._id);
            }
          }
        });
        return Array.from(shown);
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [tasks, remindersShown]);

  // In-app overdue reminders
  useEffect(() => {
    if (!tasks.length) return;
    const now = new Date();
    const shownIds = new Set(overdueRemindersShown);
    tasks.forEach(task => {
      if (
        !task.isCompleted &&
        task.dueDate &&
        !shownIds.has(task._id)
      ) {
        const due = new Date(task.dueDate);
        if (due < now) {
          toast.error(
            <div>
              <strong>Overdue Task:</strong> {task.title}<br/>
              Was due at {due.toLocaleString()}
            </div>,
            { autoClose: 12000 }
          );
          setOverdueRemindersShown(prev => [...prev, task._id]);
        }
      }
    });
  }, [tasks, overdueRemindersShown]);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setActiveTabUserId(user.userId); // Default to Self
      } else if (user.role === 'user' && user.admin) {
        setActiveTabUserId(user.userId); // Default to Self
      }
    }
  }, [user]);

  const handleAddTask = async (newTask) => {
    try {
      console.log('Submitting new task:', newTask);
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      const res = await axios.post(`${API_BASE_URL}/api/tasks`, newTask, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTasks([...tasks, res.data]);
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateTask = async (updatedTask) => {
    if (updatedTask === null) {
      setEditingTask(null);
      return;
    }
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      const res = await axios.put(`${API_BASE_URL}/api/tasks/${updatedTask._id}`, updatedTask, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? res.data : task))
      );
      setEditingTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      await axios.delete(`${API_BASE_URL}/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const task = tasks.find(t => t._id === id);
      if (!task) return;
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      let update = {};
      // Dual-completion logic
      if (task.assignedBy) {
        // Admin-assigned task
        if (user.userId === (task.assignedTo && task.assignedTo.toString())) {
          // User marks complete: only send userCompleted
          update = { userCompleted: !task.userCompleted };
        } else if (user.userId === (task.user && task.user.toString())) {
          // Admin marks complete: send adminCompleted and isCompleted
          const newAdminCompleted = !task.adminCompleted;
          const newUserCompleted = task.userCompleted;
          update = {
            adminCompleted: newAdminCompleted,
            isCompleted: newAdminCompleted && newUserCompleted
          };
        }
      } else {
        // Self-assigned task
        update = { isCompleted: !currentStatus };
      }
      const res = await axios.put(`${API_BASE_URL}/api/tasks/${id}`, update, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Refetch all tasks after update to ensure latest data
      const refreshed = await axios.get(`${API_BASE_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTasks(refreshed.data.filter(t => !t.deletedAt));
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const handleToggleSubtask = async (taskId, subtaskIdx, newCompleted) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;
      const updatedSubtasks = task.subtasks.map((sub, idx) => idx === subtaskIdx ? { ...sub, completed: newCompleted } : sub);
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      const res = await axios.put(`${API_BASE_URL}/api/tasks/${taskId}`, { subtasks: updatedSubtasks }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, subtasks: res.data.subtasks } : t));
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  // --- FILTERING LOGIC ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchText }));
  };

  const handleReset = () => {
    setFilters({ priority: '', category: '', status: '', sortBy: '', search: '' });
    setSearchText('');
  };

  // Helper to check if a date is in this week
  const isDateInThisWeek = (dateStr) => {
    if (!dateStr) return false;
    const now = new Date();
    const date = new Date(dateStr);
    now.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    const day = now.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return date >= monday && date <= sunday;
  };

  // Helper to check if a date is in this month
  const isDateInThisMonth = (dateStr) => {
    if (!dateStr) return false;
    const now = new Date();
    const date = new Date(dateStr);
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  };

  // Debug: Log all tasks for inspection
  console.log('All tasks:', tasks);
  // Filtered and sorted tasks
  let filteredTasks = [...tasks];
  // Defensive: If user or activeTabUserId is not set, show no tasks
  if (!user || !activeTabUserId) {
    filteredTasks = [];
  } else if (user.role === 'user') {
    if (activeTabUserId === user.userId) {
      // Self tab: tasks assigned to me, created by me
      filteredTasks = filteredTasks.filter(
        t => t.assignedTo === user.userId && !t.assignedBy
      );
    } else if (user.admin && activeTabUserId === user.admin) {
      // Admin tab: tasks assigned to me, created by admin
      filteredTasks = filteredTasks.filter(
        t => t.assignedTo === user.userId && t.assignedBy != null
      );
    } else {
      filteredTasks = filteredTasks.filter(t => t.assignedTo === activeTabUserId);
    }
  } else if (activeTabUserId === 'waitingApproval') {
    // Admin's Waiting for Approval tab
    filteredTasks = tasks.filter(
      t => t.assignedBy === user.userId && t.userCompleted && !t.adminCompleted && !t.deletedAt
    );
  } else {
    filteredTasks = filteredTasks.filter(t => t.assignedTo === activeTabUserId);
  }
  if (focusMode) {
    if (focusRange === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10);
      filteredTasks = filteredTasks.filter(t => !t.isCompleted && t.dueDate && t.dueDate.slice(0, 10) === todayStr);
    } else if (focusRange === 'week') {
      filteredTasks = filteredTasks.filter(t => !t.isCompleted && t.dueDate && isDateInThisWeek(t.dueDate));
    } else if (focusRange === 'month') {
      filteredTasks = filteredTasks.filter(t => !t.isCompleted && t.dueDate && isDateInThisMonth(t.dueDate));
    }
  } else {
    if (filters.priority) filteredTasks = filteredTasks.filter(t => t.priority === filters.priority);
    if (filters.category) filteredTasks = filteredTasks.filter(t => t.category === filters.category);
    if (filters.status === 'completed') filteredTasks = filteredTasks.filter(t => t.isCompleted);
    if (filters.status === 'incomplete') filteredTasks = filteredTasks.filter(t => !t.isCompleted);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(t =>
        t.title.toLowerCase().includes(s) || (t.description && t.description.toLowerCase().includes(s))
      );
    }
    if (filters.sortBy === 'title-asc') filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
    if (filters.sortBy === 'title-desc') filteredTasks.sort((a, b) => b.title.localeCompare(a.title));
    if (filters.sortBy === 'dueDate-asc') filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    if (filters.sortBy === 'dueDate-desc') filteredTasks.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  }

  // Collect unique categories from tasks for the filter dropdown
  const allCategories = Array.from(new Set(tasks.map(t => t.category))).filter(Boolean);
  const categoryOptions = [...CATEGORY_OPTIONS, ...allCategories.filter(cat => !CATEGORY_OPTIONS.includes(cat))];

  // Excel upload handler
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      setExcelPreview(json);
    };
    reader.readAsBinaryString(file);
  };

  // Helper: Excel serial date to ISO string
  const excelDateToISO = (serial) => {
    if (typeof serial === 'number') {
      const utc_days = Math.floor(serial - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);
      return date_info.toISOString().slice(0, 10);
    }
    return '';
  };

  // Confirm upload handler
  const handleConfirmUpload = async () => {
    if (!excelPreview.length) return;
    if (!usersUnderAdmin || usersUnderAdmin.length === 0) {
      toast.error('No users found under this admin.');
      return;
    }
    // Map and validate
    const processed = [];
    for (const row of excelPreview) {
      console.log('Row keys:', Object.keys(row));
      // Column normalization (case-insensitive)
      const keys = Object.keys(row).reduce((acc, k) => { acc[k.toLowerCase()] = k; return acc; }, {});
      const title = row[keys['title']] || '';
      const description = row[keys['description']] || row[keys['des']] || '';
      const assignedName = row[keys['assigned']] || '';
      let dueDateRaw = row[keys['due date']] || row[keys['duedate']] || row[keys['due_date']] || '';
      // Debug logs for user matching
      console.log('Available users:', usersUnderAdmin.map(u => u.name));
      console.log('Trying to match:', assignedName);
      // Find user by name
      const userObj = usersUnderAdmin.find(u => u.name.trim().toLowerCase() === String(assignedName).trim().toLowerCase());
      if (!userObj) {
        toast.error(`User not found: ${assignedName}`);
        return;
      }
      // Parse due date
      let dueDate = '';
      if (typeof dueDateRaw === 'number') {
        dueDate = excelDateToISO(dueDateRaw);
      } else if (typeof dueDateRaw === 'string' && dueDateRaw.trim()) {
        let d;
        if (/^\d{2}-\d{2}-\d{4}$/.test(dueDateRaw.trim())) {
          // Parse DD-MM-YYYY
          const [day, month, year] = dueDateRaw.trim().split('-');
          d = new Date(`${year}-${month}-${day}`);
        } else {
          d = new Date(dueDateRaw);
        }
        if (!isNaN(d.getTime())) {
          dueDate = d.toISOString().slice(0, 10);
        } else {
          toast.error(`Invalid due date for task: ${title}`);
          return;
        }
      }
      processed.push({
        title,
        description,
        assignedTo: userObj._id,
        dueDate,
      });
    }
    // Send to backend
    try {
      toast.info('Uploading tasks...');
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      const res = await axios.post(`${API_BASE_URL}/api/tasks/bulk-upload`, { tasks: processed }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.createdCount > 0) {
        toast.success(`${res.data.createdCount} tasks uploaded successfully!`);
        // Refetch tasks
        const refreshed = await axios.get(`${API_BASE_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTasks(refreshed.data.filter(t => !t.deletedAt));
      }
      if (res.data.failedCount > 0) {
        toast.warn(`${res.data.failedCount} tasks failed to upload.`);
        console.warn('Failed tasks:', res.data.failed);
      }
      setExcelPreview([]);
      setExcelFileName('');
    } catch (err) {
      toast.error('Failed to upload tasks.');
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (!user) return null;

  // Tabs rendering logic
  let tabs = [];
  if (user.role === 'admin' && usersUnderAdmin.length > 0) {
    tabs = [
      { label: 'Self', userId: user.userId },
      ...usersUnderAdmin.map(u => ({ label: u.name, userId: u._id })),
      { label: 'Waiting for Approval', userId: 'waitingApproval' }
    ];
  } else if (user.role === 'user' && user.admin) {
    tabs = [
      { label: 'Self', userId: user.userId },
      { label: 'Admin', userId: user.admin }
    ];
  } else {
    tabs = [{ label: 'Self', userId: user.userId }];
  }

  return (
    <>
      <AppNavbar />
      <div className="container mt-4">
        <div className="mb-3">
          <h3 className="fw-bold">Welcome, {user.name}! <span className="badge bg-info text-dark ms-2">{user.role === 'admin' ? 'Admin' : 'User'}</span></h3>
        </div>
        <div className="d-flex gap-2 mb-3">
          {tabs.map(tab => (
            <button
              key={tab.userId}
              className={`btn ${activeTabUserId === tab.userId ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTabUserId(tab.userId)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Dashboard</h2>
          <div className="d-flex gap-2 align-items-center">
            <Link to="/analytics" className="btn btn-outline-primary">Analytics</Link>
            <button
              className={`btn ${focusMode ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setFocusMode(f => !f)}
              title="Toggle Focus Mode"
            >
              <FaBullseye className="me-1" /> {focusMode ? (focusRange === 'today' ? 'Focus: Today' : focusRange === 'week' ? 'Focus: Week' : 'Focus: Month') : 'Focus Mode'}
            </button>
            {focusMode && (
              <select
                className="form-select form-select-sm ms-1"
                style={{ width: 120 }}
                value={focusRange}
                onChange={e => setFocusRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            )}
          </div>
        </div>
        <TaskStats tasks={tasks} />
        <div className="card p-4 shadow-sm mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">{editingTask ? 'Edit Task' : 'Add a New Task'}</h4>
            {user.role === 'admin' && (
              <>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  id="excel-upload-input"
                  style={{ display: 'none' }}
                  onChange={handleExcelUpload}
                />
                <button
                  className="btn btn-outline-success ms-2"
                  onClick={() => document.getElementById('excel-upload-input').click()}
                >
                  Upload Excel
                </button>
              </>
            )}
          </div>
          {/* Excel preview table */}
          {excelPreview.length > 0 && (
            <div className="mb-3">
              <div className="alert alert-info py-2 d-flex justify-content-between align-items-center">
                <span>Previewing: <strong>{excelFileName}</strong> ({excelPreview.length} tasks)</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => { setExcelPreview([]); setExcelFileName(''); }}>Clear</button>
              </div>
              <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      {Object.keys(excelPreview[0]).map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelPreview.map((row, idx) => (
                      <tr key={idx}>
                        {Object.keys(excelPreview[0]).map((col) => (
                          <td key={col}>{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-primary mt-2" onClick={handleConfirmUpload}>Confirm Upload</button>
            </div>
          )}
          <TaskForm
            onAdd={handleAddTask}
            editingTask={editingTask}
            onUpdate={handleUpdateTask}
            usersUnderAdmin={user && user.role === 'admin' ? usersUnderAdmin : undefined}
            currentUser={user}
            activeTabUserId={activeTabUserId}
          />
        </div>
        {!focusMode && (
          <TaskFilters
            filters={filters}
            categories={categoryOptions}
            onChange={handleFilterChange}
            onSearch={handleSearch}
            onReset={handleReset}
          />
        )}
        <div className="card p-4 shadow-sm">
          <h4>Your Tasks</h4>
          {filteredTasks.length === 0 ? (
            <p className="text-muted">
              {focusMode
                ? focusRange === 'today'
                  ? 'No incomplete tasks due today!'
                  : focusRange === 'week'
                    ? 'No incomplete tasks due this week!'
                    : 'No incomplete tasks due this month!'
                : 'No tasks found. Try adjusting your filters or add a new task!'}
            </p>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
              onToggleSubtask={handleToggleSubtask}
              currentUser={user}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;