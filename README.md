# 🚀 Funnel Builder & Restaurant Growth Simulator

This project is a web application designed to help users visually build, configure, and simulate lead generation funnels. It's initially tailored for restaurants and digital marketing, allowing users to understand the potential impact of different strategies before investing real resources.

## ✨ Features

*   **Drag-and-Drop Funnel Builder:** Visually construct funnels by dragging pre-defined components onto a canvas.
*   **Component Configuration:** Customize parameters for each component (e.g., CPC, conversion rates, budget allocation).
*   **Basic Simulation Engine:** Get live estimates of visitors, bookings, revenue, profit, and ROI based on the funnel configuration.
*   **Scenario Management:** Save and load funnel scenarios (currently using in-memory storage on the backend).
*   **Blueprints:** Load pre-configured funnel templates for quick starts and inspiration.

## 🛠️ Technologies Used

*   **Frontend:** React with TypeScript using Vite, Tailwind CSS, and `react-dnd` for drag-and-drop functionality.
*   **Backend:** Node.js with Express.js for API services and data persistence (in-memory for now).
*   **Testing:** Vitest for frontend, Jest for backend
*   **Linting:** ESLint for both frontend and backend

## 🚀 How to Run

### Prerequisites

- Node.js v20 or higher
- npm v9 or higher

### Quick Start (Run Both Frontend and Backend)

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Run both servers concurrently:**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:3000`

### Running Frontend Only

```bash
cd client
npm install
npm run dev
```

The React app will open at `http://localhost:3000`.

### Running Backend Only

```bash
cd server
npm install
npm start
```

For development with auto-reload:
```bash
cd server
npm run dev
```

The server will run on `http://localhost:5000`.

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Frontend Tests Only

```bash
cd client
npm test
```

### Backend Tests Only

```bash
cd server
npm test
```

## 🔍 Linting

### Lint All Code

```bash
npm run lint
```

### Lint Frontend Only

```bash
cd client
npm run lint
```

### Lint Backend Only

```bash
cd server
npm run lint
```

## 🏗️ Building for Production

### Build Frontend

```bash
cd client
npm run build
```

The production build will be in `client/dist/`.

## 📁 Project Structure

```
funnel-shop/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components (Sidebar, Canvas, ConfigPanel, etc.)
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions (calculateMetrics, etc.)
│   │   ├── test/          # Test setup and utilities
│   │   └── App.tsx        # Main application component
│   ├── package.json
│   └── vite.config.ts
├── server/                # Backend Express application
│   ├── index.js          # Main server file with API endpoints
│   ├── index.test.js     # Server tests
│   └── package.json
├── package.json          # Root package.json for running both servers
└── README.md
```

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Returns server health status

### Blueprints
- `GET /api/blueprints` - Get all available blueprint templates

### Scenarios
- `GET /api/scenarios` - Get all saved scenarios
- `GET /api/scenarios/:id` - Get a specific scenario
- `POST /api/scenarios` - Create a new scenario
- `PUT /api/scenarios/:id` - Update an existing scenario
- `DELETE /api/scenarios/:id` - Delete a scenario

## 💡 Future Enhancements

*   **Visual Connection Drawing:** Implement a more intuitive UI for drawing connections between funnel steps.
*   **Advanced Simulation Logic:** Refine the `calculateMetrics` function to support more complex funnel flows and interdependencies between components.
*   **Database Integration:** Replace in-memory storage with a persistent database (e.g., PostgreSQL) for robust data management.
*   **User Authentication:** Implement full user login/registration.
*   **Export Options:** Enhance PDF export and add other export formats.
*   **Optimization Algorithms:** Develop features to auto-optimize funnel parameters for desired outcomes.

