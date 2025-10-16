import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashRestore, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Trash = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchTrashed = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/tasks/trash`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setTasks(res.data);
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchTrashed();
  }, []);

  const handleRestore = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/tasks/${id}/restore`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleDeleteForever = async (id) => {
    if (!window.confirm('Permanently delete this task? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${id}/permanent`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      // Optionally handle error
    }
  };

  return (
    <div className="container mt-4">
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate('/dashboard')}
        title="Back to Dashboard"
      >
        <FaArrowLeft className="me-1" /> Back to Dashboard
      </button>
      <h2 className="mb-4">Recently Deleted Tasks</h2>
      {loading ? (
        <div>Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="alert alert-info">No recently deleted tasks.</div>
      ) : (
        <div className="list-group">
          {tasks.map(task => (
            <div key={task._id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{task.title}</strong>
                {task.dueDate && (
                  <span className="ms-2 text-muted">Due: {new Date(task.dueDate).toLocaleString()}</span>
                )}
                <span className="ms-2 badge bg-secondary">Deleted: {new Date(task.deletedAt).toLocaleString()}</span>
              </div>
              <div>
                <button className="btn btn-sm btn-success me-2" title="Restore" onClick={() => handleRestore(task._id)}>
                  <FaTrashRestore /> Restore
                </button>
                <button className="btn btn-sm btn-danger" title="Delete Forever" onClick={() => handleDeleteForever(task._id)}>
                  <FaTrash /> Delete Forever
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trash; 