# CampusConnect

CampusConnect is a React (Vite) single-page application for discovering, filtering, and registering for college events, backed by a separate Express API. Registrations (Users and Bookings) are persisted in MySQL through Sequelize with a tenant-isolated schema and transactional writes; Events and SystemLogs are persisted in MongoDB through Mongoose.

## Features

- React single-page experience with existing navigation and page layouts
- Student event browsing with search, category filtering, and expandable event details across Home, Events, About, Register, and Contact pages
- Axios-based event loading, event registration, and admin event management
- Event registration persisted in MySQL through Sequelize `User` and `Booking` models, isolated per college by `tenantId` and written inside a database transaction (a failed booking rolls back the associated user insert)
- Admin Event Management at `/admin/events`, with create, edit, delete, a nested `schedule`, and flexible `metadata`, backed by a MongoDB `Event` model
- SystemLog entries recorded automatically in MongoDB (`SystemLog` model) whenever an event is created, updated, or deleted
- A MongoDB seed script migrates historical events and telemetry out of `db.json`, which is now kept only as a legacy/backup migration source rather than the runtime data store
- Internal-only Admin Activity Logs at `/admin/activity-logs`, showing SystemLog activity
- Shared event state refreshes after admin changes so the student Events and registration pages continue using current MongoDB-backed event data
- Express REST API with JSON parsing, CORS, request logging, 404, and global error handling, running against MySQL and MongoDB at the same time

## Project Structure

- index.html - Main HTML entry page
- src/main.jsx - React entry point
- src/components/App.jsx - Main app component and event loading state
- src/components/Router.jsx - Student routes (Home, Events, About, Register, Contact) and admin routes (`/admin/events`, `/admin/activity-logs`)
- src/components/RegistrationForm.jsx - Event registration form, including college (tenant) selection, posting to the MySQL-backed `/api/registrations`
- src/components/AdminEventManagement.jsx - Admin event CRUD interface for the MongoDB-backed `/api/events`
- src/components/AdminActivityLogs.jsx - Admin SystemLog activity table
- src/components/AdminSidebar.jsx - Internal admin navigation
- src/api/client.js - Shared Axios API client
- backend/server.js - Express API, routes, and middleware
- backend/db/sequelize.js - MySQL connection (Sequelize)
- backend/db/mongodb.js - MongoDB connection (Mongoose)
- backend/models/User.js, backend/models/Booking.js - Sequelize models for MySQL
- backend/models/Event.js, backend/models/SystemLog.js - Mongoose models for MongoDB
- backend/migrations/ - Sequelize migrations for the `users` and `bookings` tables, including tenant isolation constraints
- backend/scripts/seed-mongodb.js - Migrates events and telemetry from `db.json` into MongoDB
- backend/scripts/verify-transaction.js - Verifies that a failed booking rolls back the associated user insert
- backend/db.json - Legacy/backup migration source for events and telemetry (no longer the runtime data store)
- styles.css - Existing styling reused for the UI
- ai-docs/milestones.md - Development milestones and planning notes

## How to View the Project

Install frontend and backend dependencies:

```bash
npm install
npm --prefix backend install
```

Configure `backend/.env` (see `backend/.env.example`) with your local MySQL and MongoDB connection settings, then run the one-time database setup:

```bash
npm --prefix backend run db:migrate
npm --prefix backend run db:seed-mongodb
```
## Local Development

Run the frontend and backend separately using `npm run dev` in their respective project folders.

```

Then open the local Vite URL shown in the terminal.

## Technologies Used

- React
- React Router
- Vite
- Axios
- Node.js
- Express
- CORS
- MySQL
- Sequelize
- MongoDB
- Mongoose
- HTML
- CSS
- JavaScript

## Registration and MySQL

The Register page collects a student's college as a `tenantId` alongside their event registration. `POST /api/registrations` runs inside a Sequelize transaction that finds-or-creates the `User` for that `tenantId`/email and creates the `Booking`, so a registration is only saved if both writes succeed. Sequelize migrations enforce the tenant isolation: a unique `tenantId`+`email` constraint on users, a unique `tenantId`+`userId`+`eventName` constraint on bookings, and a composite `userId`+`tenantId` foreign key so a booking can only reference a user in the same tenant.

## Admin event management

Open `/admin/events` to manage events. The form uses the existing `POST /api/events`, `PUT /api/events/:id`, and `DELETE /api/events/:id` APIs, which read and write MongoDB through the `Event` Mongoose model. `schedule` and `metadata` accept JSON objects, so event-specific nested fields can be retained without changing the form schema. When editing an existing event, `schedule` and `metadata` are normalized to plain objects whether the API returns them as objects or JSON strings, so the form always shows valid JSON object text and Create/Update both succeed without a "must be a JSON object" error. Saving an event automatically records a SystemLog entry in MongoDB, and after each event mutation the page refreshes `GET /api/events` and checks `/api/system-logs` for the corresponding SystemLog activity.
