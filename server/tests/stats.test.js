const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Task = require('../models/Task');
const User = require('../models/User');

require('dotenv').config();

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
  await Task.deleteMany({});
  await User.deleteMany({});

  const userRes = await request(app).post('/api/auth/signup').send({
    name: 'Stat Tester',
    email: 'stat@example.com',
    password: 'Stat1234'
  });

  token = userRes.body.token;

  // ✅ Find user by email to get _id
  const user = await User.findOne({ email: 'stat@example.com' });

  // ✅ Create valid tasks
  await Task.insertMany([
    {
      user: user._id,
      title: 'Test Task 1',
      isCompleted: true,
      priority: 'High',
      category: 'Work'
    },
    {
      user: user._id,
      title: 'Test Task 2',
      isCompleted: false,
      priority: 'Low',
      category: 'Personal'
    }
  ]);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Task Stats API', () => {
  it('should return task stats', async () => {
    const res = await request(app)
      .get('/api/tasks/stats?range=all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalTasks');
    expect(res.body).toHaveProperty('completedTasks');
    expect(res.body).toHaveProperty('pendingTasks');
  });
});
