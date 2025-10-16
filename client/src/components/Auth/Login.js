import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaTasks } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', role: '', adminType: '', admin: '' });
  const [error, setError] = useState('');
  const [admins, setAdmins] = useState([]);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (form.role === 'user') {
      // Fetch admins from backend
      const fetchAdmins = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/auth/admins`);
          setAdmins(res.data.admins);
        } catch (err) {
          setAdmins([]);
        }
      };
      fetchAdmins();
    }
  }, [form.role, API_BASE_URL]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setForm({ ...form, role, adminType: '', admin: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only send email and password to backend
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email: form.email, password: form.password });
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #b3e5fc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="w-100" style={{ maxWidth: 400 }}>
        <div className="text-center mb-4">
          <FaTasks className="fs-1 text-primary mb-2" />
          <h2 className="fw-bold mb-1">Welcome back!</h2>
          <div className="text-muted mb-2">Stay organized and productive with Smart Task Tracker.</div>
        </div>
        <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px', background: '#bbdefb' }}>
          <h3 className="text-center mb-4">
            <FaLock className="me-2 text-primary" />
            Login to Your Account
          </h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select className="form-select" name="role" value={form.role} onChange={handleRoleChange} required>
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            {form.role === 'admin' && (
              <div className="mb-3">
                <label className="form-label">Admin Type</label>
                <select className="form-select" name="adminType" value={form.adminType} onChange={handleChange} required>
                  <option value="">Select Admin Type</option>
                  <option value="Admin 1">Admin 1</option>
                  <option value="Admin 2">Admin 2</option>
                  <option value="Admin 3">Admin 3</option>
                </select>
              </div>
            )}
            {form.role === 'user' && (
              <div className="mb-3">
                <label className="form-label">Select Admin</label>
                <select className="form-select" name="admin" value={form.admin} onChange={handleChange} required>
                  <option value="">Select Admin</option>
                  {admins.map((admin) => (
                    <option key={admin._id} value={admin._id}>{admin.name} ({admin.adminType})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="mb-3 input-group">
              <span className="input-group-text bg-white"><FaEnvelope /></span>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3 input-group">
              <span className="input-group-text bg-white"><FaLock /></span>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
          </form>
          <div className="text-center">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;