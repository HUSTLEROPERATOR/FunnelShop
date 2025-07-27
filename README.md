# 🚀 Funnel Builder & Restaurant Growth Simulator

This project is a web application designed to help users visually build, configure, and simulate lead generation funnels. It's initially tailored for restaurants and digital marketing, allowing users to understand the potential impact of different strategies before investing real resources.

## ✨ Features

*   **Drag-and-Drop Funnel Builder:** Visually construct funnels by dragging pre-defined components onto a canvas.
*   **Component Configuration:** Customize parameters for each component (e.g., CPC, conversion rates, budget allocation).
*   **Basic Simulation Engine:** Get live estimates of visitors, bookings, revenue, profit, and ROI based on the funnel configuration.
*   **Scenario Management:** Save and load funnel scenarios (currently using in-memory storage on the backend).
*   **Blueprints:** Load pre-configured funnel templates for quick starts and inspiration.

## 🛠️ Technologies Used

*   **Frontend:** React (JavaScript) with `react-dnd` for drag-and-drop functionality.
*   **Backend:** Node.js with Express.js (JavaScript) for API services and data persistence (in-memory for now).

## 🚀 How to Run

1.  **Navigate to the project root:**
    ```bash
    cd C:\Users\risto\Desktop\IDEE 2025\FUNNEL\funnel-builder
    ```

2.  **Start the Backend Server:**
    Open a new terminal, navigate to the `server` directory, and run:
    ```bash
    cd server
    npm install # Install backend dependencies if you haven't already
    npm start
    ```
    The server will run on `http://localhost:5000`.

3.  **Start the Frontend Development Server:**
    Open another new terminal, navigate to the `client` directory, and run:
    ```bash
    cd client
    npm install # Install frontend dependencies if you haven't already
    npm start
    ```
    The React app will open in your browser (usually at `http://localhost:3000`).

## 💡 Future Enhancements

*   **Visual Connection Drawing:** Implement a more intuitive UI for drawing connections between funnel steps.
*   **Advanced Simulation Logic:** Refine the `calculateMetrics` function to support more complex funnel flows and interdependencies between components.
*   **Database Integration:** Replace in-memory storage with a persistent database (e.g., PostgreSQL) for robust data management.
*   **User Authentication:** Implement full user login/registration.
*   **Export Options:** Enhance PDF export and add other export formats.
*   **Optimization Algorithms:** Develop features to auto-optimize funnel parameters for desired outcomes.

