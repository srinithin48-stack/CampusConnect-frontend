# Project milestones

## Overview

CampusConnect is a responsive React application for discovering, filtering, and registering for college events. It uses a blue-and-white design system, React Router for page navigation, Axios for API calls, and an Express backend with `db.json` as its lightweight data store.

## Milestones completed

1. Create the React application structure.
   - Set up a Vite + React project with reusable components and page-level routes.
   - Added shared navigation and footer components.

2. Build the student-facing pages.
   - Created Home, Events, About, Register, and Contact pages.
   - Kept navigation, routing, and existing student functionality consistent across the application.

3. Build the event browsing experience.
   - Added event cards with expandable details.
   - Added search and category filtering while preserving the existing Events page interaction.
   - Moved event loading from local data to Axios `GET /api/events` through the backend API.

4. Refine the visual design and responsiveness.
   - Polished spacing, typography, alignment, cards, forms, navigation, footer, and responsive layouts.
   - Updated the Home, Events, About, Register, and Contact layouts to match the supplied visual references while preserving the blue-and-white theme.

5. Add working registration with validation.
   - Connected the registration form to Axios `POST /api/registrations`.
   - Added beginner-friendly validation, success/error messages, and conditional valid/invalid field styling.
   - Continued using the existing registration form layout and visual style.

6. Add telemetry tracking for completed registrations.
   - After a successful registration, the app now posts a telemetry record to `POST /api/telemetry`.
   - Telemetry includes the student name, selected event, `registered` action, current date/time, and `confirmed` status.
   - Visiting the Register page does not create a telemetry record; only successful form submission does.

7. Add internal Admin Activity Logs.
   - Added the internal route `/admin/activity-logs` without adding it to the student navigation.
   - Fetches current telemetry through Axios `GET /api/telemetry`.
   - Displays Student, Event, Action, Date/Time, and Status in an interactive table.
   - Includes search, status filtering, loading, error, and empty states.
   - Formats valid dates consistently as `Aug 12, 2026, 10:55 AM`.

8. Sanitize and normalize raw telemetry.
   - Preserved the intentionally irregular telemetry records in `db.json`.
   - Used `filter()`, `map()`, optional chaining, `trim()`, null/empty-value fallbacks, and capitalization normalization before displaying records.

9. Replace JSON Server with a Node.js and Express backend.
   - Added a separate `backend` folder with Express and CORS configured for the Vite frontend.
   - Added JSON request-body parsing and reusable request logging middleware.
   - Implemented `GET /api/events`, `POST /api/registrations`, `GET /api/telemetry`, `POST /api/telemetry`, and `DELETE /api/events/:id` endpoints.
   - Added structured global error responses and 404 handling for invalid API routes.

## Project highlights

- React and React Router for a structured single-page application
- Axios GET and POST integration with an Express REST API
- Persistent mock data in `db.json` for events, registrations, and telemetry
- Form validation with accessible feedback and conditional styling
- Internal telemetry table for monitoring recent student activity and registrations
- Responsive blue-and-white UI across desktop, tablet, and mobile sizes

## Local development

Run the mock API and the Vite app in separate terminals:

```bash
npm run api
npm run dev
```
