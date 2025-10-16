const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../index');
const connectDB = require('../config/db');
const Task = require('../models/Task');
const User = require('../models/User');

let token;
let userId;
let createdTaskId;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();

  // Cleanup any existing test user
  await User.deleteOne({ email: 'test@example.com' });

  // Create test user
  const user = new User({
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpass123'
  });
  await user.save();
  userId = user._id;

  // JWT token for auth
  token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await Task.deleteMany({ user: userId });
  await User.deleteMany({ email: 'test@example.com' });
  await mongoose.connection.close();
});

describe('Task CRUD APIs', () => {
  it('should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        priority: 'Medium',
        category: 'Work',
        description: 'This is a test task',
        isCompleted: false,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Task');
    createdTaskId = res.body._id;
  });

  it('should get all tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update a task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Task' });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Task');
  });

  it('should delete a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Task deleted');
  });
});
