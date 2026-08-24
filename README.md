# CampusConnect

CampusConnect is a modular React application with an Express backend. It preserves the existing student UI while providing event loading, registration, and telemetry APIs.

## Features

- React single-page experience with existing navigation and page layouts
- Axios event loading, event registration, and telemetry activity tracking
- State-driven search, category filtering, and expandable event details
- Internal-only Admin Activity Logs with sanitized telemetry records
- Express REST API with JSON parsing, CORS, request logging, 404, and global error handling

## Project Structure

- index.html - Main HTML entry page
- src/main.jsx - React entry point
- src/components/App.jsx - Main app component and event loading state
- src/api/client.js - Shared Axios API client
- backend/server.js - Express API and middleware
- db.json - Event, registration, and telemetry data store
- styles.css - Existing styling reused for the UI
- ai-docs/milestones.md - Development milestones and planning notes

## How to View the Project

Install frontend and backend dependencies, then run the API and frontend in separate terminals:

```bash
npm install
npm --prefix backend install
npm run api
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Technologies Used

- React
- Vite
- Axios
- Node.js
- Express
- CORS
- HTML
- CSS
- JavaScript
