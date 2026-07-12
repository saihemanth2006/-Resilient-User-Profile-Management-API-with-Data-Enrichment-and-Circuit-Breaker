const request = require('supertest');
const express = require('express');
const { z } = require('zod');
const UserService = require('../../src/services/UserService');
const UserController = require('../../src/controllers/UserController');
const createUserRoutes = require('../../src/routes/userRoutes');
const errorHandler = require('../../src/middleware/errorHandler');
const asyncHandler = require('../../src/middleware/asyncHandler');

function buildApp(service) {
  const app = express();
  app.use(express.json());
  const controller = new UserController(service);
  app.use('/api/users', createUserRoutes(controller));
  app.use(errorHandler);
  return app;
}

describe('API integration behavior', () => {
  test('returns enriched user data when service succeeds', async () => {
    const service = {
      createUser: jest.fn(),
      getUserById: jest.fn(async (id) => ({ id, name: 'Alice', email: 'alice@example.com', registrationDate: '2023-01-01T00:00:00.000Z' })),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      getEnrichedUser: jest.fn(async (id) => ({ id, name: 'Alice', email: 'alice@example.com', registrationDate: '2023-01-01T00:00:00.000Z', enrichedDataStatus: 'available', enrichment: { recentActivity: [], loyaltyScore: 900 } })),
    };
    const app = buildApp(service);

    const response = await request(app).get('/api/users/user-1/enriched');
    expect(response.status).toBe(200);
    expect(response.body.enrichedDataStatus).toBe('available');
  });
});
