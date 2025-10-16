import React from 'react';
import { Link } from 'react-router-dom';
import { FaTasks, FaBrain, FaChartLine, FaMobileAlt, FaCheckCircle, FaClock, FaStar, FaUsers } from 'react-icons/fa';
import Footer from '../components/Layout/Footer';

const Home = () => {
  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm" style={{ background: '#e3f2fd', color: '#1976d2', boxShadow: '0 2px 8px rgba(31,38,135,0.08)' }}>
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/" style={{ color: '#1976d2' }}>
            <FaTasks className="me-2" />
            Smart Task Tracker
          </Link>
          
          <div className="navbar-nav ms-auto">
            <Link className="btn btn-outline-primary me-2" to="/login">Log In</Link>
            <Link className="btn btn-primary" to="/signup">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4 text-primary">
                The Smartest Way<br />
                to Track Your Tasks
              </h1>
              <p className="lead mb-4 text-dark">
                Add tasks in plain English, get instant analytics, set reminders, and stay productive with unlimited, AI-powered task management. All for free.
              </p>
              <ul className="mb-4 ps-3 text-dark">
                <li>Natural language task entry ("Buy groceries tomorrow at 5pm")</li>
                <li>Subtasks, checklists, and recurring tasks</li>
                <li>Smart reminders & productivity analytics</li>
                <li>Modern UI with dark mode and mobile support</li>
              </ul>
              <div className="d-flex gap-3">
                <Link to="/signup" className="btn btn-light btn-lg px-4">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-light btn-lg px-4">
                  Log In
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="bg-white rounded-3 p-4 shadow-lg">
                <div className="card border-0">
                  <div className="card-body">
                    <h6 className="text-primary mb-3">Sample Dashboard</h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="badge bg-success">Personal</span>
                      <span className="badge bg-warning">Medium</span>
                    </div>
                    <h6>Finish React Project (with subtasks)</h6>
                    <p className="text-muted small">Due: Next Monday, 5pm</p>
                    <div className="progress mb-2" style={{height: '6px'}}>
                      <div className="progress-bar bg-success" style={{width: '60%'}}></div>
                    </div>
                    <small className="text-muted">2/5 Subtasks Complete</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Everything You Need to Stay on Track</h2>
            <p className="lead text-muted">All-in-one productivity, powered by smart features</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                    <FaTasks className="text-primary fs-3" />
                  </div>
                  <h5 className="card-title">Natural Language Task Entry</h5>
                  <p className="card-text text-muted">
                    Add tasks just by typing—"Doctor appointment next Thursday at 4pm". We'll fill in the details for you!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                    <FaCheckCircle className="text-success fs-3" />
                  </div>
                  <h5 className="card-title">Subtasks & Recurring Tasks</h5>
                  <p className="card-text text-muted">
                    Break big goals into checklists, set up recurring tasks, and never miss a routine again.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                    <FaChartLine className="text-warning fs-3" />
                  </div>
                  <h5 className="card-title">Analytics & Productivity Score</h5>
                  <p className="card-text text-muted">
                    Visualize your progress, see completed/pending stats, and get a gamified productivity score.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                    <FaStar className="text-info fs-3" />
                  </div>
                  <h5 className="card-title">Modern UI & Dark Mode</h5>
                  <p className="card-text text-muted">
                    Enjoy a beautiful, responsive interface with one-click dark mode and mobile support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-light py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="display-6 fw-bold mb-4">Why Choose Smart Task Tracker?</h2>
              <div className="d-flex align-items-center mb-3">
                <FaCheckCircle className="text-success me-3 fs-4" />
                <div>
                  <h6 className="mb-1">Never Miss a Deadline</h6>
                  <p className="text-muted mb-0">Smart reminders and recurring tasks keep you on track.</p>
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <FaCheckCircle className="text-success me-3 fs-4" />
                <div>
                  <h6 className="mb-1">Boost Your Productivity</h6>
                  <p className="text-muted mb-0">Visual analytics and a gamified score motivate you to achieve more.</p>
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <FaCheckCircle className="text-success me-3 fs-4" />
                <div>
                  <h6 className="mb-1">Easy, Unlimited Task Entry</h6>
                  <p className="text-muted mb-0">Add as many tasks as you want, as fast as you can type.</p>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <FaCheckCircle className="text-success me-3 fs-4" />
                <div>
                  <h6 className="mb-1">Modern, Distraction-Free Design</h6>
                  <p className="text-muted mb-0">A beautiful, clean interface that works everywhere.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="bg-white rounded-3 p-4 shadow">
                <h5 className="text-center mb-4">App Highlights</h5>
                <div className="row text-center">
                  <div className="col-6 mb-3">
                    <div className="bg-primary bg-opacity-10 rounded p-3">
                      <h3 className="text-primary mb-1">Unlimited</h3>
                      <small className="text-muted">Tasks & Subtasks</small>
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <div className="bg-success bg-opacity-10 rounded p-3">
                      <h3 className="text-success mb-1">100%</h3>
                      <small className="text-muted">Free to Use</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-warning bg-opacity-10 rounded p-3">
                      <h3 className="text-warning mb-1">AI</h3>
                      <small className="text-muted">Natural Language Input</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-info bg-opacity-10 rounded p-3">
                      <h3 className="text-info mb-1">24/7</h3>
                      <small className="text-muted">Access Anywhere</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">How It Works</h2>
            <p className="lead text-muted">Get started in just a few simple steps</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-3 text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <span className="fw-bold fs-4 text-primary">1</span>
              </div>
              <h5>Sign Up</h5>
              <p className="text-muted">Create your account in seconds</p>
            </div>
            <div className="col-md-3 text-center">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <span className="fw-bold fs-4 text-success">2</span>
              </div>
              <h5>Add Tasks</h5>
              <p className="text-muted">Create your first tasks and set priorities</p>
            </div>
            <div className="col-md-3 text-center">
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <span className="fw-bold fs-4 text-warning">3</span>
              </div>
              <h5>Track Progress</h5>
              <p className="text-muted">Monitor your progress and build habits</p>
            </div>
            <div className="col-md-3 text-center">
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <span className="fw-bold fs-4 text-info">4</span>
              </div>
              <h5>Get Insights</h5>
              <p className="text-muted">Receive AI-powered recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-5">
        <div className="container text-center">
          <h2 className="display-6 fw-bold mb-3">Ready to Get Organized?</h2>
          <p className="lead mb-4">Join thousands of users who have transformed their productivity</p>
          <Link to="/signup" className="btn btn-light btn-lg px-5">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
