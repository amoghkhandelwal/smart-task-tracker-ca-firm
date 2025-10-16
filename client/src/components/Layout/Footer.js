import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const modalContent = {
  about: {
    title: 'About SmartTracker',
    body: (
      <>
        <p><strong>SmartTracker</strong> is your modern, AI-powered productivity companion. Organize your life, one task at a time, with natural language input, analytics, reminders, subtasks, and more—all in a beautiful, responsive interface.</p>
        <p>Our mission: Make task management effortless, insightful, and enjoyable for everyone.</p>
      </>
    ),
  },
  features: {
    title: 'Features',
    body: (
      <ul>
        <li>📝 <strong>Natural Language Input:</strong> Add tasks like "Doctor appointment next Thursday at 4pm"—we’ll parse the date/time for you.</li>
        <li>📊 <strong>Analytics & Insights:</strong> Visualize your productivity, completed/pending/recurring tasks, and more.</li>
        <li>🌑 <strong>Dark Mode:</strong> Beautiful, accessible design for day or night.</li>
        <li>🔔 <strong>Reminders:</strong> Get notified before tasks are due.</li>
        <li>✅ <strong>Subtasks:</strong> Break big tasks into actionable steps with checklists.</li>
        <li>♻️ <strong>Recurring Tasks:</strong> Automate your routines.</li>
        <li>🗑️ <strong>Trash/Undo:</strong> Restore deleted tasks within 48 hours.</li>
        <li>📱 <strong>Mobile Friendly:</strong> Use anywhere, on any device.</li>
        <li>🔒 <strong>Secure & Private:</strong> Your data is yours—always.</li>
      </ul>
    ),
  },
  contact: {
    title: 'Contact',
    body: (
      <>
        <p>Have feedback, questions, or need support?</p>
        <ul>
          <li>Email: <a href="mailto:amoghkhandelwal01@gmail.com">support@smarttracker.app</a></li>
          <li>Twitter: <a href="https://twitter.com/smarttrackerapp" target="_blank" rel="noopener noreferrer">@smarttrackerapp</a></li>
        </ul>
        <p>We love hearing from our users!</p>
      </>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    body: (
      <>
        <p>Your privacy matters. SmartTracker does <strong>not</strong> sell or share your data. All your tasks and information are securely stored and only accessible to you.</p>
        <ul>
          <li>We use secure authentication and encrypted connections.</li>
          <li>You can delete your account and all data at any time.</li>
          <li>No ads, no tracking, no spam—ever.</li>
        </ul>
        <p>For details, see our full privacy policy or contact us.</p>
      </>
    ),
  },
};

const Footer = () => {
  const [show, setShow] = useState(null); // null or 'about' | 'features' | 'contact' | 'privacy'

  const handleShow = (modal) => setShow(modal);
  const handleClose = () => setShow(null);

  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div>
          <h5 className="mb-1">SmartTracker</h5>
          <div className="mb-2">Organize your life, one task at a time. Smart task management with AI-powered insights.</div>
        </div>
        <nav>
          <Button variant="link" className="text-light me-3" onClick={() => handleShow('about')}>About</Button>
          <Button variant="link" className="text-light me-3" onClick={() => handleShow('features')}>Features</Button>
          <Button variant="link" className="text-light me-3" onClick={() => handleShow('contact')}>Contact</Button>
          <Button variant="link" className="text-light" onClick={() => handleShow('privacy')}>Privacy</Button>
        </nav>
      </div>
      {/* Modal */}
      <Modal show={!!show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{show && modalContent[show].title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{show && modalContent[show].body}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </footer>
  );
};

export default Footer;
