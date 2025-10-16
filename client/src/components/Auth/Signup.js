import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaTasks } from 'react-icons/fa';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', adminType: '', admin: '' });
  const [error, setError] = useState('');
  const [admins, setAdmins] = useState([]);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    if (form.role === 'user') {
      // Fetch admins from backend
      const fetchAdmins = async () => {
        try {
          const API_BASE_URL = process.env.REACT_APP_API_URL;
          const res = await axios.get(`${API_BASE_URL}/api/auth/admins`);
          setAdmins(res.data.admins);
        } catch (err) {
          setAdmins([]);
        }
      };
      fetchAdmins();
    }
  }, [form.role]);

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
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      const payload = { ...form };
      if (form.role === 'admin') delete payload.admin;
      if (form.role === 'user') delete payload.adminType;
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, payload);
      localStorage.setItem('token', res.data.token);
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Signup failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #b3e5fc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="w-100" style={{ maxWidth: 400 }}>
        <div className="text-center mb-4">
          <FaTasks className="fs-1 text-primary mb-2" />
          <h2 className="fw-bold mb-1">Create Your Free Account</h2>
          <div className="text-muted mb-2">Start organizing your life with Smart Task Tracker.</div>
        </div>
        <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px', background: '#bbdefb' }}>
          <h3 className="text-center mb-4">
            <FaLock className="me-2 text-primary" />
            Sign Up
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
              <span className="input-group-text bg-white"><FaUser /></span>
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3 input-group">
              <span className="input-group-text bg-white"><FaEnvelope /></span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="form-control"
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
                placeholder="Password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button className="btn btn-primary w-100 mb-3" type="submit">
              Sign Up
            </button>
          </form>
          <div className="text-center">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;