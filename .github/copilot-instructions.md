# Funnel Builder & Restaurant Growth Simulator

A web application for visually building, configuring, and simulating lead generation funnels, initially tailored for restaurants and digital marketing.

**ALWAYS follow these instructions first and fallback to additional search and context gathering ONLY when the information here is incomplete or found to be in error.**

## Repository Status

**CRITICAL**: This repository is currently documentation-only. The `client` and `server` directories mentioned in README.md do not exist yet. Follow the setup instructions below to create the project structure before making any code changes.

## Working Effectively

### Prerequisites and Setup
- Node.js v20+ is required and available in the environment
- Run these commands to set up the project structure as documented:

```bash
# Create project directories
mkdir -p client server

# Set up React frontend (TypeScript)
cd client
npx create-react-app . --template typescript
npm install react-dnd react-dnd-html5-backend
cd ..

# Set up Express.js backend
cd server
npm init -y
npm install express cors
npm install --save-dev nodemon
cd ..
```

### Build and Development Commands

**Frontend (React with TypeScript):**
- Install dependencies: `cd client && npm install`
- Start development server: `cd client && npm start` -- opens at http://localhost:3000
- Build for production: `cd client && npm run build` -- takes ~15 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- Run tests: `cd client && npm test -- --watchAll=false` -- takes ~5 seconds. Set timeout to 30+ seconds.
- Lint code: `cd client && npx eslint src --ext .ts,.tsx`

**Backend (Node.js/Express):**
- Install dependencies: `cd server && npm install`
- Start server: `cd server && npm start` -- runs on http://localhost:5000
- Development with auto-reload: `cd server && npm run dev` (requires nodemon)

### Critical Timing and Timeout Information

- **React app creation**: Takes 3-5 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
- **npm install (frontend)**: Takes 30-60 seconds. Set timeout to 5+ minutes.
- **npm install (backend)**: Takes 10-20 seconds. Set timeout to 2+ minutes.
- **React build**: Takes 10-15 seconds. Set timeout to 60+ seconds.
- **React tests**: Takes 5-10 seconds. Set timeout to 30+ seconds.
- **ESLint**: Takes 5-10 seconds. Set timeout to 30+ seconds.

## Validation Requirements

### Pre-Change Validation
ALWAYS run these commands before making any changes:
1. `cd client && npm install && npm run build`
2. `cd client && npm test -- --watchAll=false`
3. `cd client && npx eslint src --ext .ts,.tsx`
4. `cd server && npm install`

### Post-Change Validation
ALWAYS run these validation steps after making changes:
1. Build the frontend: `cd client && npm run build`
2. Run frontend tests: `cd client && npm test -- --watchAll=false`
3. Lint the code: `cd client && npx eslint src --ext .ts,.tsx`
4. **MANUAL TESTING REQUIRED**: Start both servers and test the complete user workflow

### Manual Testing Scenarios
After making changes, ALWAYS test these scenarios:
1. **Drag-and-Drop Workflow**: Start both servers, open http://localhost:3000, drag components from sidebar to canvas
2. **Component Configuration**: Select a component on canvas and modify its properties
3. **Simulation Engine**: Verify live metrics calculation (visitors, bookings, revenue, ROI)
4. **Save/Load Scenarios**: Test saving and loading funnel configurations
5. **Blueprints Feature**: Test loading pre-configured funnel templates

## Project Structure and Key Locations

### Frontend (`client/` directory)
- `src/App.tsx` - Main React application component
- `src/components/` - Reusable React components
- `src/utils/calculateMetrics.js` - Core simulation logic function
- Uses `react-dnd` for drag-and-drop functionality

### Backend (`server/` directory) 
- `index.js` or `app.js` - Express.js server entry point
- API endpoints for saving/loading funnel scenarios (in-memory storage)
- Runs on port 5000 by default

### Configuration Files
- `client/package.json` - Frontend dependencies and scripts
- `client/tsconfig.json` - TypeScript configuration
- `server/package.json` - Backend dependencies and scripts

## Common Development Tasks

### Adding New Funnel Components
1. Create component in `client/src/components/`
2. Add drag-and-drop support using `react-dnd`
3. Update simulation logic in `calculateMetrics` function
4. Test drag-drop workflow manually

### Modifying Simulation Logic
1. Edit `calculateMetrics` function
2. Test with various component configurations
3. Verify metrics calculations are accurate
4. Always test the complete user workflow

### API Development
1. Add endpoints in `server/` Express app
2. Update frontend API calls
3. Test save/load functionality manually
4. Verify data persistence (currently in-memory)

## Technology Stack
- **Frontend**: React 19+ with TypeScript, react-dnd for drag-and-drop
- **Backend**: Node.js with Express.js
- **Build Tools**: Create React App (CRA) - note: CRA is deprecated but functional
- **Testing**: Jest (via react-scripts)
- **Linting**: ESLint (configured via react-scripts)

## Important Notes

- **CRA Deprecation**: create-react-app shows deprecation warnings but is functional
- **No Database**: Currently uses in-memory storage on backend
- **CORS Configuration**: Backend should include CORS for frontend communication
- **Proxy Setup**: Frontend should proxy API requests to backend (port 5000)

## CI/CD Considerations
When implementing CI/CD:
- Always run `npx eslint src --ext .ts,.tsx` before committing
- Ensure both frontend build and tests pass
- Manual testing scenarios must be validated for UI changes

## Debugging Tips
- Check browser console for React errors
- Verify API endpoints are responding (use browser dev tools Network tab)
- Test drag-and-drop in different browsers
- Monitor backend logs for API issues

## Future Architecture
Based on GEMINI.md, planned enhancements include:
- Visual connection drawing between funnel steps
- Persistent database integration (PostgreSQL)
- User authentication system
- Enhanced PDF export capabilities
- Auto-optimization algorithms