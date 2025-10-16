const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// Allowed CA emails for each admin type
const CA_EMAILS = {
  'Admin 1': 'ca1@gmail.com',
  'Admin 2': 'ca2@gmail.com',
  'Admin 3': 'ca3@gmail.com'
};

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, adminType, admin } = req.body;

    // Validate role
    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ msg: 'Role must be admin or user' });
    }

    // If admin, adminType is required
    if (role === 'admin' && !['Admin 1', 'Admin 2', 'Admin 3'].includes(adminType)) {
      return res.status(400).json({ msg: 'Admin type must be Admin 1, Admin 2, or Admin 3' });
    }

    // Restrict admin signup to specific emails
    if (role === 'admin') {
      if (email !== CA_EMAILS[adminType]) {
        return res.status(403).json({ msg: 'You are not authorized to register as this admin type.' });
      }
      // Prevent duplicate admin signup for the same adminType
      const existingAdmin = await User.findOne({ role: 'admin', adminType });
      if (existingAdmin) {
        return res.status(400).json({ msg: `${adminType} is already taken` });
      }
    }

    // If user, admin is required
    if (role === 'user' && !admin) {
      return res.status(400).json({ msg: 'User must be assigned to an admin' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({ name, email, password: hashedPassword, role, adminType: role === 'admin' ? adminType : undefined, admin: role === 'user' ? admin : undefined });
    await user.save();

    // Create JWT token with role and admin info
    const payload = { userId: user._id, name: user.name, email: user.email, role: user.role, adminType: user.adminType, admin: user.admin };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: payload });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Create JWT token with role and admin info
    const payload = { userId: user._id, name: user.name, email: user.email, role: user.role, adminType: user.adminType, admin: user.admin };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: payload });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all valid admins for user signup
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find(
      { role: 'admin', adminType: { $in: ['Admin 1', 'Admin 2', 'Admin 3'] } },
      '_id name adminType'
    );
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch admins' });
  }
});

// Get all users under a specific admin
router.get('/users-under-admin', async (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) return res.status(400).json({ msg: 'adminId is required' });
    const users = await User.find({ admin: adminId }, '_id name email');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch users under admin' });
  }
});

// TEMPORARY: Delete all admin users (use once, then remove for security)
router.delete('/delete-all-admins', async (req, res) => {
  try {
    const result = await User.deleteMany({ role: 'admin' });
    res.json({ msg: 'All admin users deleted', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete admins' });
  }
});

// TEMPORARY: Delete all user accounts (use once, then remove for security)
router.delete('/delete-all-users', async (req, res) => {
  try {
    const result = await User.deleteMany({ role: 'user' });
    res.json({ msg: 'All user accounts deleted', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete users' });
  }
});

module.exports = router;