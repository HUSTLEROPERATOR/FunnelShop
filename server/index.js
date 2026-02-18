require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// === CORS CONFIG ===
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const allowedOrigins = corsOrigin
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Permette tool senza header Origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());



// Validation middleware
const validateScenarioData = (req, res, next) => {
  const { components, globalParameters } = req.body;

  // Validate components array
  if (components && Array.isArray(components)) {
    for (const comp of components) {
      if (comp.properties) {
        // Validate numeric properties
        for (const [key, value] of Object.entries(comp.properties)) {
          if (typeof value === 'number') {
            if (isNaN(value) || value < 0) {
              return res.status(400).json({
                error: `Invalid ${key} in component ${comp.id}: must be a non-negative number`,
              });
            }
            // Validate percentages (conversion rates, etc.)
            if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percentage')) {
              if (value > 1) {
                return res.status(400).json({
                  error: `Invalid ${key} in component ${comp.id}: rate must be between 0 and 1`,
                });
              }
            }
          }
        }
      }
    }
  }

  // Validate global parameters
  if (globalParameters) {
    const numericFields = ['monthlyBudget', 'averageCheckSize', 'customerLifetimeVisits', 'profitMargin'];
    for (const field of numericFields) {
      const value = globalParameters[field];
      if (value !== undefined) {
        if (typeof value !== 'number' || isNaN(value) || value < 0) {
          return res.status(400).json({
            error: `Invalid ${field}: must be a non-negative number`,
          });
        }
        // Validate profit margin is a percentage
        if (field === 'profitMargin' && value > 1) {
          return res.status(400).json({
            error: `Invalid profitMargin: must be between 0 and 1`,
          });
        }
      }
    }
  }

  next();
};

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

// Get a specific blueprint by ID
app.get('/api/blueprints/:id', (req, res) => {
  const blueprint = dataStore.blueprints.find((b) => b.id === req.params.id);
  if (!blueprint) {
    return res.status(404).json({ error: 'Blueprint not found' });
  }
  res.json(blueprint);
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
app.post('/api/scenarios', validateScenarioData, (req, res) => {
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
app.put('/api/scenarios/:id', validateScenarioData, (req, res) => {
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
app.use((err, req, res, _next) => {
  console.error('[ERROR]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// 404 handler
app.use((req, res) => {
  console.log('[404]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
  });
  res.status(404).json({ error: 'Not found' });
});

// Start server
const server = app.listen(PORT, () => {
  const env = process.env.NODE_ENV || process.env.NODE_ENV || 'development';
  console.log("🚀 FunnelShop Server is running!");
  console.log("📍 URL:", `http://localhost:${PORT}`);
  console.log("🌍 Environment:", env);
  console.log("🔗 CORS Origins:", allowedOrigins.join(', '));
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    console.log('✅ Server closed. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Export for testing
module.exports = { app, server };
