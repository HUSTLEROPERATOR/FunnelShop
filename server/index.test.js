const request = require('supertest');
const { app, server } = require('./index');

describe('API Endpoints', () => {
  afterAll((done) => {
    server.close(done);
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/blueprints', () => {
    it('should return list of blueprints', async () => {
      const response = await request(app).get('/api/blueprints');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('components');
    });
  });

  describe('Scenario CRUD', () => {
    let createdScenarioId;

    it('should create a new scenario', async () => {
      const scenario = {
        name: 'Test Scenario',
        description: 'Test description',
        components: [
          {
            id: 'test-1',
            type: 'google-ads',
            name: 'Test Google Ads',
            position: { x: 0, y: 0 },
            properties: { cpc: 2.0, budget: 1000 },
          },
        ],
        globalParameters: {
          monthlyBudget: 5000,
          averageCheckSize: 40,
          customerLifetimeVisits: 3,
          profitMargin: 0.25,
        },
      };

      const response = await request(app).post('/api/scenarios').send(scenario);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(scenario.name);
      expect(response.body).toHaveProperty('createdAt');

      createdScenarioId = response.body.id;
    });

    it('should get all scenarios', async () => {
      const response = await request(app).get('/api/scenarios');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get a specific scenario', async () => {
      const response = await request(app).get(`/api/scenarios/${createdScenarioId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdScenarioId);
      expect(response.body).toHaveProperty('name');
    });

    it('should update a scenario', async () => {
      const updates = {
        name: 'Updated Scenario',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/scenarios/${createdScenarioId}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updates.name);
      expect(response.body.description).toBe(updates.description);
    });

    it('should delete a scenario', async () => {
      const response = await request(app).delete(`/api/scenarios/${createdScenarioId}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent scenario', async () => {
      const response = await request(app).get('/api/scenarios/non-existent');

      expect(response.status).toBe(404);
    });
  });

  describe('Error handling', () => {
    it('should return 400 for invalid scenario creation', async () => {
      const response = await request(app).post('/api/scenarios').send({
        name: 'Test',
        // Missing required fields
      });

      expect(response.status).toBe(400);
    });

    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown');

      expect(response.status).toBe(404);
    });
  });
});
