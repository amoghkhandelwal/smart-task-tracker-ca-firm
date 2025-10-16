import React, { useEffect, useState, useContext } from 'react';
import AppNavbar from '../components/Layout/Navbar';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaPrint, FaFilePdf, FaArrowLeft } from 'react-icons/fa';

const Achieve = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [category, setCategory] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [usersUnderAdmin, setUsersUnderAdmin] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    const fetchTasks = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL;
        const res = await axios.get(`${API_BASE_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const completed = res.data.filter(t => t.isCompleted && !t.deletedAt);
        setTasks(completed);
        console.log('Completed tasks:', completed);
      } catch (err) {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
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
    fetchTasks();
    fetchUsers();
  }, [user, navigate]);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (!user || user.role !== 'admin') return null;

  // User filter options with names/emails
  const userOptions = usersUnderAdmin.map(u => ({ value: u._id, label: u.name ? `${u.name} (${u.email})` : u.email || u._id }));

  // Filtered and grouped tasks
  const filtered = tasks.filter(t => {
    let ok = true;
    // Handle both string and object for assignedTo
    const assignedToId = t.assignedTo && typeof t.assignedTo === 'object' ? t.assignedTo._id : String(t.assignedTo);
    if (userFilter !== 'all') {
      ok = ok && assignedToId === String(userFilter);
    }
    if (dateFrom) ok = ok && t.completedAt && new Date(t.completedAt) >= new Date(dateFrom);
    if (dateTo) ok = ok && t.completedAt && new Date(t.completedAt) <= new Date(dateTo);
    if (category) ok = ok && t.category === category;
    return ok;
  });
  // Group by assignedTo string
  const grouped = {};
  filtered.forEach(t => {
    const assignedToId = t.assignedTo && typeof t.assignedTo === 'object' ? t.assignedTo._id : String(t.assignedTo);
    if (!grouped[assignedToId]) grouped[assignedToId] = { user: usersUnderAdmin.find(u => u._id === assignedToId) || { name: assignedToId }, tasks: [] };
    grouped[assignedToId].tasks.push(t);
  });

  // Debug log before rendering
  console.log('Grouped:', grouped);

  // Export/print handlers
  const handlePrint = () => {
    window.print();
  };
  const handleExportPDF = async () => {
    const el = document.getElementById('achieveAccordion');
    if (!el) return;
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;
    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    pdf.save('achieve-report.pdf');
  };

  return (
    <>
      <AppNavbar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Achieve: Completed Tasks by User</h2>
          <div className="d-flex gap-2 align-items-center">
            <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}><FaArrowLeft className="me-1" /> Dashboard</button>
            <button className="btn btn-outline-secondary" onClick={handlePrint}><FaPrint className="me-1" /> Print</button>
            <button className="btn btn-outline-danger" onClick={handleExportPDF}><FaFilePdf className="me-1" /> Export as PDF</button>
          </div>
        </div>
        {/* Filters */}
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">User</label>
            <select className="form-select" value={userFilter} onChange={e => setUserFilter(e.target.value)}>
              <option value="all">All</option>
              {userOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">From</label>
            <input type="date" className="form-control" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label">To</label>
            <input type="date" className="form-control" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All</option>
              {[...new Set(tasks.map(t => t.category))].filter(Boolean).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        {Object.keys(grouped).length === 0 ? (
          <div className="alert alert-info">No completed tasks found.</div>
        ) : (
          <div className="accordion" id="achieveAccordion">
            {Object.entries(grouped).map(([userId, data], idx) => (
              <div className="accordion-item" key={userId}>
                <h2 className="accordion-header" id={`heading${idx}`}>
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${idx}`} aria-expanded={userFilter === 'all' || userFilter === userId ? 'true' : 'false'} aria-controls={`collapse${idx}`}>
                    {data.user.name ? `${data.user.name} (${data.user.email})` : userId}
                  </button>
                </h2>
                <div id={`collapse${idx}`} className={`accordion-collapse collapse${userFilter === 'all' || userFilter === userId ? ' show' : ''}`} aria-labelledby={`heading${idx}`} data-bs-parent="#achieveAccordion">
                  <div className="accordion-body">
                    <ul className="list-group">
                      {data.tasks.map(task => (
                        <li key={task._id} className="list-group-item d-flex flex-column align-items-start">
                          <span className="fw-bold">{task.title}</span>
                          <span className="small">{task.description}</span>
                          <span className="small text-muted">Completed: {task.completedAt ? new Date(task.completedAt).toLocaleString() : 'N/A'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Achieve; 