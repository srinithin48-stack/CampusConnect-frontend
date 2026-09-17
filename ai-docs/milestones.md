# Project milestones

## Overview

CampusConnect is a responsive React application for discovering, filtering, and registering for college events. It uses a blue-and-white design system, React Router for page navigation, and Axios for API calls against an Express backend. Registrations (Users and Bookings) are persisted in MySQL through Sequelize with a tenant-isolated schema and transactional writes; Events and SystemLogs are persisted in MongoDB through Mongoose. `db.json` is no longer the runtime data store — it is kept only as the legacy/backup source used to migrate historical events and telemetry into MongoDB.

## Milestones completed

### Weeks 1-4

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
   - Preserved the intentionally irregular telemetry records that lived in `db.json` at the time.
   - Used `filter()`, `map()`, optional chaining, `trim()`, null/empty-value fallbacks, and capitalization normalization before displaying records.

9. Replace JSON Server with a Node.js and Express backend.
   - Added a separate `backend` folder with Express and CORS configured for the Vite frontend.
   - Added JSON request-body parsing and reusable request logging middleware.
   - Implemented `GET /api/events`, `POST /api/registrations`, `GET /api/telemetry`, `POST /api/telemetry`, and `DELETE /api/events/:id` endpoints backed by `db.json`.
   - Added structured global error responses and 404 handling for invalid API routes.

### Week 5 - MySQL and Sequelize integration

10. Add MySQL persistence with Sequelize for Users and Bookings.
    - Connected the Express API to MySQL via Sequelize, configured through `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` environment variables.
    - Added Sequelize migrations that create the `users` and `bookings` tables, including a unique `tenantId`+`email` constraint on users, a unique `tenantId`+`userId`+`eventName` constraint on bookings, and a `bookings.userId` foreign key to `users`.
    - Added a follow-up migration enforcing a composite tenant-aware foreign key (`userId`, `tenantId`) from bookings to users, so a booking can only reference a user in the same tenant.
    - Added `User` and `Booking` Sequelize models with field validation (required fields, email format, string length limits) and `role`/`status` enums.
    - Reworked `POST /api/registrations` to run inside a `sequelize.transaction`: it finds-or-creates the `User` for the submitted `tenantId`/email, then creates the `Booking`, so a registration only persists if both writes succeed together.
    - Added a transaction-rollback verification script that intentionally submits an invalid booking status and confirms the failed booking insert rolls back the associated user insert.
    - Registrations are now stored in MySQL, replacing `db.json` as the write target for new registrations.

### Week 6 - MongoDB, Event/SystemLog models, and Admin Event Management

Registrations continue to be persisted in MySQL (Week 5); Events and SystemLogs are persisted in MongoDB (Week 6), with both databases connected simultaneously by the same Express API.

11. Add MongoDB persistence for Events and SystemLogs alongside MySQL.
    - Connected the Express API to MongoDB via Mongoose, started together with the MySQL connection on boot so both databases run at the same time.
    - Added an `Event` Mongoose model with a nested `schedule` (an array of schedule-item sub-documents covering title, description, start/end time, and location) and a flexible `metadata` field (`Mixed` type), plus `speakers`, `organizers`, and `tags`.
    - Added a `SystemLog` Mongoose model, with `post('save')`, `post('findOneAndUpdate')`, and `post('findOneAndDelete')` hooks on `Event` that automatically record `EVENT_CREATED`, `EVENT_UPDATED`, and `EVENT_DELETED` activity.
    - Migrated existing events and telemetry out of `db.json` into MongoDB with a seed script that upserts by legacy ID, so `db.json` is now used only as the legacy/backup source for that one-time migration, not as the runtime store.
    - Rewired `GET/POST /api/events`, `GET/PUT/DELETE /api/events/:id`, and `GET /api/system-logs` to query the Mongoose models.

12. Add Admin Event Management.
    - Added the internal `/admin/events` route and an admin sidebar linking Event Management and Activity Logs.
    - Connected Create, Edit, and Delete controls to `POST /api/events`, `PUT /api/events/:id`, and `DELETE /api/events/:id`.
    - Added JSON-object inputs for the nested `schedule` and flexible `metadata` fields, plus line-based event details.
    - Refreshed the shared event data after each successful mutation so student event browsing and registration remain in sync with the current MongoDB-backed event data.
    - Added a SystemLog verification check following create, update, and delete actions.

13. Fix Edit Event schedule/metadata parsing.
    - Normalized `schedule` and `metadata` when opening the Edit Event form, so values are handled correctly whether the API returns them as objects or JSON strings.
    - Removed a double-encoding bug where a JSON-string `schedule`/`metadata` field became an invalid quoted string in the form and incorrectly failed the "must be a JSON object" check on save.
    - Kept Create and Update accepting the same JSON object input with no changes to the UI, CRUD behavior, or API structure.

## Project highlights

- React and React Router for a structured single-page application
- Axios GET and POST integration with an Express REST API
- MySQL (Sequelize) for Users and Bookings, with a tenant-isolated schema, field validation, and transactional registration writes
- MongoDB (Mongoose) for Events and SystemLogs, with nested schedule data and a flexible metadata field
- `db.json` retained only as the legacy/backup source for the one-time migration of historical events and telemetry into MongoDB
- Form validation with accessible feedback and conditional styling
- Internal telemetry table for monitoring recent student activity and registrations
- Responsive blue-and-white UI across desktop, tablet, and mobile sizes
- Admin CRUD workflow that preserves the existing student navigation and routes

## Local development

Start MySQL and MongoDB locally (see the backend's `.env.example` for connection settings), run the one-time migration and seed scripts, then start the API and frontend in separate terminals:

```bash
npm --prefix backend run db:migrate
npm --prefix backend run db:seed-mongodb
npm run api
npm run dev
```
