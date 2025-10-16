const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const testToken = jwt.sign({ userId: 'dummyUserId' }, process.env.JWT_SECRET);

afterAll(async () => {
  await mongoose.connection.close();
});

describe('AI Suggestion Route', () => {
  it('should return AI suggestions for a valid title', async () => {
    const res = await request(app)
      .post('/api/tasks/ai-suggest')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ title: 'book dentist appointment tomorrow' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('suggestedTitle');
    expect(res.body).toHaveProperty('suggestedPriority');
    expect(res.body).toHaveProperty('suggestedCategory');
  });

  it('should return 400 if title is missing', async () => {
    const res = await request(app)
      .post('/api/tasks/ai-suggest')
      .set('Authorization', `Bearer ${testToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
  });
});
