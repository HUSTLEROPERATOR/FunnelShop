const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for funnel scenarios
let funnelScenarios = {};
let scenarioIdCounter = 1;

// API Routes
app.get('/api/scenarios', (req, res) => {
  res.json(Object.values(funnelScenarios));
});

app.get('/api/scenarios/:id', (req, res) => {
  const scenario = funnelScenarios[req.params.id];
  if (scenario) {
    res.json(scenario);
  } else {
    res.status(404).json({ error: 'Scenario not found' });
  }
});

app.post('/api/scenarios', (req, res) => {
  const scenario = {
    id: scenarioIdCounter++,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  funnelScenarios[scenario.id] = scenario;
  res.status(201).json(scenario);
});

app.put('/api/scenarios/:id', (req, res) => {
  const id = req.params.id;
  if (funnelScenarios[id]) {
    funnelScenarios[id] = {
      ...funnelScenarios[id],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    res.json(funnelScenarios[id]);
  } else {
    res.status(404).json({ error: 'Scenario not found' });
  }
});

app.delete('/api/scenarios/:id', (req, res) => {
  const id = req.params.id;
  if (funnelScenarios[id]) {
    delete funnelScenarios[id];
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Scenario not found' });
  }
});

// Blueprint templates
const blueprints = [
  {
    id: 'restaurant-basic',
    name: 'Restaurant Basic Funnel',
    description: 'A simple funnel for restaurant lead generation',
    components: [
      {
        id: 'social-ads',
        type: 'SocialMediaAds',
        position: { x: 100, y: 100 },
        props: {
          platform: 'Facebook',
          budget: 500,
          cpc: 0.5,
          targetAudience: 'Local food lovers'
        }
      },
      {
        id: 'landing-page',
        type: 'LandingPage',
        position: { x: 300, y: 100 },
        props: {
          conversionRate: 15,
          offerType: 'Free appetizer'
        }
      },
      {
        id: 'booking-system',
        type: 'BookingSystem',
        position: { x: 500, y: 100 },
        props: {
          conversionRate: 80,
          averageBookingValue: 45
        }
      }
    ]
  },
  {
    id: 'restaurant-advanced',
    name: 'Restaurant Advanced Funnel',
    description: 'Multi-channel funnel with email follow-up',
    components: [
      {
        id: 'google-ads',
        type: 'GoogleAds',
        position: { x: 50, y: 50 },
        props: {
          budget: 800,
          cpc: 0.75,
          keywords: 'restaurant near me'
        }
      },
      {
        id: 'social-ads-2',
        type: 'SocialMediaAds',
        position: { x: 50, y: 200 },
        props: {
          platform: 'Instagram',
          budget: 400,
          cpc: 0.4
        }
      },
      {
        id: 'landing-page-2',
        type: 'LandingPage',
        position: { x: 300, y: 125 },
        props: {
          conversionRate: 18,
          offerType: 'Discount voucher'
        }
      },
      {
        id: 'email-sequence',
        type: 'EmailSequence',
        position: { x: 500, y: 125 },
        props: {
          openRate: 25,
          clickRate: 8,
          conversionRate: 12
        }
      },
      {
        id: 'booking-system-2',
        type: 'BookingSystem',
        position: { x: 700, y: 125 },
        props: {
          conversionRate: 85,
          averageBookingValue: 52
        }
      }
    ]
  }
];

app.get('/api/blueprints', (req, res) => {
  res.json(blueprints);
});

app.get('/api/blueprints/:id', (req, res) => {
  const blueprint = blueprints.find(bp => bp.id === req.params.id);
  if (blueprint) {
    res.json(blueprint);
  } else {
    res.status(404).json({ error: 'Blueprint not found' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Funnel Builder API ready!`);
});