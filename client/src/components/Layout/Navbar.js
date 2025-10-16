// src/components/Layout/Navbar.js
import React, { useContext, useEffect, useState } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { FaTrash, FaLightbulb } from 'react-icons/fa';
import { Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';

const AppNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { theme, setTheme } = useContext(ThemeContext);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tasks/insights`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setInsights(res.data.insights || []);
    } catch (err) {
      setInsights(['Failed to load insights.']);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (showInsights) {
      fetchInsights();
    }
    // eslint-disable-next-line
  }, [showInsights]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className={theme === 'dark' ? 'navbar-dark' : 'navbar-light'}>
      <Container>
        <Navbar.Brand href="/">Smart Task Tracker</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="justify-content-end">
          <Nav className="align-items-center">
            <button
              className={`btn btn-sm ${theme === 'dark' ? 'btn-light' : 'btn-dark'} ms-2`}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <Link to="/analytics" className={`nav-link${theme === 'dark' ? ' text-light' : ''} me-2`}>
              Analytics
            </Link>
            <Link to="/trash" className={`nav-link d-flex align-items-center${theme === 'dark' ? ' text-light' : ''} me-2`}>
              <FaTrash className="me-1" /> Trash
            </Link>
            {user && user.role === 'admin' && (
              <Link to="/achieve" className={`nav-link d-flex align-items-center${theme === 'dark' ? ' text-light' : ''} me-2`}>
                <FaLightbulb className="me-1" /> Achieve
              </Link>
            )}
            {user && (
              <>
                <Navbar.Text className="me-3">
                  Signed in as: <strong>{user.userId?.slice(0, 8)}...</strong>
                </Navbar.Text>
                <Button
                  variant={theme === 'dark' ? 'outline-light' : 'outline-dark'}
                  className="me-2 d-flex align-items-center"
                  onClick={() => setShowInsights(true)}
                  title="AI Insights"
                >
                  <FaLightbulb className="me-1" /> Insights
                </Button>
                <Button variant={theme === 'dark' ? 'outline-light' : 'outline-dark'} onClick={handleLogout}>Logout</Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
      <Modal show={showInsights} onHide={() => setShowInsights(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>AI Insights</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingInsights ? (
            <div className="text-center my-4"><Spinner animation="border" /></div>
          ) : (
            <ul>
              {insights.map((ins, idx) => (
                <li key={idx}>{ins}</li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInsights(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Navbar>
  );
};

export default AppNavbar;
