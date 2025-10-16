const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    required: true
  },
  adminType: {
    type: String,
    enum: ['Admin 1', 'Admin 2', 'Admin 3'],
    required: function() { return this.role === 'admin'; }
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.role === 'user'; }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);


