const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (structured for future DB migration)
const dataStore = {
  scenarios: new Map(),
  blueprints: [
    {
      id: 'restaurant-basic',
      name: 'Restaurant Basic Funnel',
      description: 'A basic funnel template for restaurant marketing',
      components: [
        {
          id: 'google-ads-1',
          type: 'google-ads',
          name: 'Google Ads Campaign',
          position: { x: 50, y: 50 },
          properties: { cpc: 2.0, budget: 4000 },
        },
        {
          id: 'landing-page-1',
          type: 'landing-page',
          name: 'Landing Page',
          position: { x: 250, y: 50 },
          properties: { conversionRate: 0.15 },
        },
        {
          id: 'booking-form-1',
          type: 'booking-form',
          name: 'Booking Form',
          position: { x: 450, y: 50 },
          properties: { conversionRate: 0.25 },
        },
      ],
      globalParameters: {
        monthlyBudget: 10000,
        averageCheckSize: 50,
        customerLifetimeVisits: 5,
        profitMargin: 0.3,
      },
    },
    {
      id: 'restaurant-advanced',
      name: 'Restaurant Advanced Funnel',
      description: 'An advanced multi-channel funnel for restaurants',
      components: [
        {
          id: 'google-ads-1',
          type: 'google-ads',
          name: 'Google Ads',
          position: { x: 50, y: 50 },
          properties: { cpc: 2.0, budget: 4000 },
        },
        {
          id: 'facebook-ads-1',
          type: 'facebook-ads',
          name: 'Facebook Ads',
          position: { x: 50, y: 150 },
          properties: { cpc: 1.5, budget: 3000 },
        },
        {
          id: 'email-campaign-1',
          type: 'email-campaign',
          name: 'Email Campaign',
          position: { x: 50, y: 250 },
          properties: { recipients: 1000, clickThroughRate: 0.05, cost: 100 },
        },
        {
          id: 'landing-page-1',
          type: 'landing-page',
          name: 'Landing Page',
          position: { x: 300, y: 150 },
          properties: { conversionRate: 0.2 },
        },
        {
          id: 'booking-form-1',
          type: 'booking-form',
          name: 'Booking Form',
          position: { x: 550, y: 150 },
          properties: { conversionRate: 0.3 },
        },
      ],
      globalParameters: {
        monthlyBudget: 15000,
        averageCheckSize: 60,
        customerLifetimeVisits: 6,
        profitMargin: 0.35,
      },
    },
  ],
  nextScenarioId: 1,
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Get all blueprints
app.get('/api/blueprints', (req, res) => {
  res.json(dataStore.blueprints);
});

// Get all scenarios
app.get('/api/scenarios', (req, res) => {
  const scenarios = Array.from(dataStore.scenarios.values());
  res.json(scenarios);
});

// Get a specific scenario by ID
app.get('/api/scenarios/:id', (req, res) => {
  const scenario = dataStore.scenarios.get(req.params.id);
  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  res.json(scenario);
});

// Create a new scenario
app.post('/api/scenarios', (req, res) => {
  const { name, description, components, globalParameters } = req.body;

  if (!name || !components || !globalParameters) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = `scenario-${dataStore.nextScenarioId++}`;
  const now = new Date().toISOString();

  const scenario = {
    id,
    name,
    description: description || '',
    components,
    globalParameters,
    createdAt: now,
    updatedAt: now,
  };

  dataStore.scenarios.set(id, scenario);
  res.status(201).json(scenario);
});

// Update a scenario
app.put('/api/scenarios/:id', (req, res) => {
  const scenario = dataStore.scenarios.get(req.params.id);
  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }

  const { name, description, components, globalParameters } = req.body;

  const updatedScenario = {
    ...scenario,
    name: name !== undefined ? name : scenario.name,
    description: description !== undefined ? description : scenario.description,
    components: components !== undefined ? components : scenario.components,
    globalParameters: globalParameters !== undefined ? globalParameters : scenario.globalParameters,
    updatedAt: new Date().toISOString(),
  };

  dataStore.scenarios.set(req.params.id, updatedScenario);
  res.json(updatedScenario);
});

// Delete a scenario
app.delete('/api/scenarios/:id', (req, res) => {
  const scenario = dataStore.scenarios.get(req.params.id);
  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }

  dataStore.scenarios.delete(req.params.id);
  res.status(204).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Export for testing
module.exports = { app, server };
