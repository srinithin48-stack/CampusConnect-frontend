# CampusConnect

CampusConnect is a React (Vite) single-page application for discovering, filtering, and registering for college events, backed by a separate Express API. Registrations (Users and Bookings) are persisted in MySQL through Sequelize with a tenant-isolated schema and transactional writes, where each college is a row in a `tenants` table referenced by a numeric `tenantId`. Events and SystemLogs are persisted in MongoDB through Mongoose. Students create accounts and log in with bcrypt-hashed passwords and JWTs. Admin pages are restricted to `admin` accounts, pages are lazy-loaded, and an admin-only Routing Analytics page reports real route visits, navigation failures, and access-denied events.

## Features

- React single-page experience with existing navigation and page layouts
- Student event browsing with search, category filtering, and expandable event details across Home, Events, About, Register, and Contact pages
- Refreshed Home page with a campus illustration, featured-event card, highlight stats, and call to action
- Axios-based event loading, event registration, and admin event management
- Create Account (`/create-account`) and Login (`/login`) pages with form validation, a show/hide password toggle, and clear error messages
- Passwords stored as bcrypt hashes; login returns a JWT carrying `userId`, numeric `tenantId`, `role`, and an expiry
- `AuthContext` login state shared across the app, with "Remember me" (`localStorage`) or session-only (`sessionStorage`) token storage, automatic logout when the token expires or a protected API returns `401`, and the token kept out of `window` globals
- Role-based admin routes: every `/admin/*` page requires an `admin` account. Logged-out visitors are sent to Login and returned to the requested page afterwards; students and staff are sent to an Access Denied page. The navbar and admin sidebar show Login or Logout to match the login state
- Lazy-loaded pages with `React.lazy` and `Suspense`: Home and Login are in the main bundle, every other page is its own chunk, public pages are prefetched when the browser is idle, and a failed chunk shows a reload message
- Admin-only Routing Analytics at `/admin/routing-analytics`, showing recorded route visits, navigation failures, and access-denied events, with a time-range filter
- Event Registration shows the backend's error messages (for example a duplicate booking) and a clear message when the server cannot be reached
- College dropdown on Login, Create Account, and Event Registration, with a "+ Add Other College" option for colleges that are not listed
- Colleges stored in a `tenants` table: a typed college name reuses the matching tenant's numeric ID, or creates a new tenant, without creating duplicates
- Event registration persisted in MySQL through Sequelize `User` and `Booking` models, isolated per college by `tenantId` and written inside a database transaction (a failed booking rolls back the associated user insert)
- Admin Event Management at `/admin/events`, with create, edit, delete, a nested `schedule`, and flexible `metadata`, backed by a MongoDB `Event` model
- SystemLog entries recorded automatically in MongoDB (`SystemLog` model) whenever an event is created, updated, or deleted
- A MongoDB seed script migrates historical events and telemetry out of `db.json`, which is now kept only as a legacy/backup migration source rather than the runtime data store
- Internal-only Admin Activity Logs at `/admin/activity-logs`, showing SystemLog activity to admins (routing analytics records are shown on their own page instead)
- `GET /api/system-logs` restricted to admins on the backend (`401` without a token, `403` for students), and a `db:promote-admin` script to create admin accounts
- Shared event state refreshes after admin changes so the student Events and registration pages continue using current MongoDB-backed event data
- Express REST API with JSON parsing, CORS, request logging, 404, and global error handling, running against MySQL and MongoDB at the same time
- Frontend tests with Vitest and React Testing Library, and backend tests with Jest and Supertest

## Project Structure

- index.html - Main HTML entry page
- src/main.jsx - React entry point
- src/components/App.jsx - Main app component and event loading state
- src/components/Router.jsx - Student routes (Home, Events, About, Register, Contact, Login, Create Account, Access Denied) and admin routes (`/admin/events`, `/admin/activity-logs`, `/admin/routing-analytics`), with lazy loading, `Suspense`, idle prefetching, and not-found tracking
- src/components/LoginPage.jsx - Login form with college selection
- src/components/CreateAccountPage.jsx - Account registration form with college selection
- src/components/ProtectedRoute.jsx - Sends logged-out users to Login and users without an allowed role to Access Denied, and records the denial
- src/components/AccessDeniedPage.jsx - Shown when a non-admin opens an admin page
- src/components/RouteTracker.jsx - Records a route visit once each navigation settles
- src/components/RouteErrorBoundary.jsx - Shows a reload message and records a navigation failure when a page fails to load
- src/components/AdminRoutingAnalytics.jsx - Admin Routing Analytics page
- src/components/RegistrationForm.jsx - Event registration form, including college (tenant) selection, posting to the MySQL-backed `/api/registrations`
- src/components/AdminEventManagement.jsx - Admin event CRUD interface for the MongoDB-backed `/api/events`
- src/components/AdminActivityLogs.jsx - Admin SystemLog activity table
- src/components/AdminSidebar.jsx - Internal admin navigation
- src/context/AuthContext.jsx - Login state, token storage, and logout
- src/api/client.js - Shared Axios API client that attaches the JWT and handles `401` responses
- src/api/colleges.js - College dropdown list, the "+ Add Other College" option, and college-name validation
- src/api/routeAnalytics.js - Records route events through `POST /api/telemetry`
- src/test/ - Vitest tests for authentication, college selection, form integration, role-based routes, routing analytics, and lazy loading
- backend/server.js - Express API, routes, and middleware
- backend/middleware/auth.js - JWT `authenticate` middleware for protected routes, plus `requireRole`/`requireAdmin`
- backend/db/sequelize.js - MySQL connection (Sequelize)
- backend/db/mongodb.js - MongoDB connection (Mongoose)
- backend/models/Tenant.js, backend/models/User.js, backend/models/Booking.js - Sequelize models for MySQL
- backend/models/Event.js, backend/models/SystemLog.js - Mongoose models for MongoDB
- backend/migrations/ - Sequelize migrations for the `users`, `bookings`, and `tenants` tables, including tenant isolation constraints and the conversion to numeric tenant IDs
- backend/scripts/seed-mongodb.js - Migrates events and telemetry from `db.json` into MongoDB
- backend/scripts/verify-transaction.js - Verifies that a failed booking rolls back the associated user insert
- backend/scripts/promote-admin.js - Promotes an existing user to `admin`
- backend/tests/ - Jest and Supertest tests for authentication, the JWT middleware, admin authorization, validation, event authorization, and database failures
- backend/ai-docs/prompt-tests.md - Week 9 and Week 10 backend review notes and test results
- backend/db.json - Legacy/backup migration source for events and telemetry (no longer the runtime data store)
- styles.css - Existing styling reused for the UI
- ai-docs/milestones.md - Development milestones and planning notes
- ai-docs/week-10.md - Week 10 routing, code-splitting, and analytics notes, with measured performance and test results

## How to View the Project

Install frontend and backend dependencies:

```bash
npm install
npm --prefix backend install
```

Configure `backend/.env` (see `backend/.env.example`) with your local MySQL and MongoDB connection settings and a `JWT_SECRET`, then run the one-time database setup:

```bash
npm --prefix backend run db:migrate
npm --prefix backend run db:seed-mongodb
```

Sign-up always creates student accounts. To open the admin pages, promote an existing account:

```bash
npm --prefix backend run db:promote-admin -- <email> [tenantId]
```

## Local Development

Start the API and the frontend in separate terminals:

```bash
npm run api
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Testing

```bash
npm test                    # frontend (Vitest)
npm --prefix backend test   # backend (Jest); needs MySQL, MongoDB, and JWT_SECRET
```

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
- bcrypt
- JSON Web Tokens
- Vitest and React Testing Library
- Jest and Supertest
- HTML
- CSS
- JavaScript

## Registration and MySQL

The Register page collects a student's college alongside their event registration. `POST /api/registrations` runs inside a Sequelize transaction that resolves the college's tenant, finds-or-creates the `User` for that `tenantId`/email, and creates the `Booking`, so a registration is only saved if all writes succeed. Sequelize migrations enforce the tenant isolation: a unique `tenantId`+`email` constraint on users, a unique `tenantId`+`userId`+`eventName` constraint on bookings, foreign keys from both tables to `tenants`, and a composite `userId`+`tenantId` foreign key so a booking can only reference a user in the same tenant.

## Accounts and login

`POST /api/auth/register` creates a student account for the selected college, hashing the password with bcrypt and rejecting a duplicate email within the same college. `POST /api/auth/login` checks the email and password for the selected college and returns a JWT. The frontend keeps the token in `AuthContext` and the Axios client, sends it as `Authorization: Bearer <token>`, and logs out automatically when it expires or the API returns `401`. `GET /api/system-logs` requires a valid token from an `admin` account (see Admin authorization below).

## Colleges and tenants

Each college is a row in the MySQL `tenants` table with a numeric `id`, a unique `slug` (for example `psna`), and a `name`. The college dropdown sends the slug for listed colleges. Choosing "+ Add Other College" shows a College Name field; the form validates the name (2-150 characters, must contain letters, and only letters, numbers, spaces, and `. , & ' ( ) / -`) and sent as `tenantId`. When creating an account or registering for an event, the API reuses an existing tenant whose slug or name matches (ignoring case), or otherwise creates a new tenant, and saves the user and booking with its numeric `tenantId`. Login only looks colleges up and never creates a tenant.

## Admin event management

Log in with an admin account and open `/admin/events` to manage events. The form uses the existing `POST /api/events`, `PUT /api/events/:id`, and `DELETE /api/events/:id` APIs, which read and write MongoDB through the `Event` Mongoose model. `schedule` and `metadata` accept JSON objects, so event-specific nested fields can be retained without changing the form schema. When editing an existing event, `schedule` and `metadata` are normalized to plain objects whether the API returns them as objects or JSON strings, so the form always shows valid JSON object text and Create/Update both succeed without a "must be a JSON object" error. Saving an event automatically records a SystemLog entry in MongoDB, and after each event mutation the page refreshes `GET /api/events` and checks `/api/system-logs` for the corresponding SystemLog activity.

## Verification and fixes (Week 9)

Status: completed.

- **Backend:** Sequelize validation errors return `400` instead of `500`. Event create, edit, and delete now require a valid JWT. Password length and email format are checked on the server. Event bodies that are not a JSON object are rejected. 14 tests were added, and the backend tests (31) pass. Details are in the backend's `ai-docs/prompt-tests.md`.
- **Frontend:** the Create Account, Login, and Event Registration forms were checked against the live API. Event Registration now shows the backend's error messages and a clear unreachable-server message, no longer reports a saved booking as failed when only telemetry fails, matches the backend's email and name-length rules, and says when events could not be loaded. 12 tests were added, and the frontend tests (38) pass.

## Role-based routes, code splitting, and Routing Analytics (Week 10)

Status: completed.

- **Role-based routes:** every `/admin/*` page requires an `admin` account. Logged-out visitors go to Login and come back afterwards; students and staff go to `/access-denied`, and no admin API is called.
- **Admin-only API:** `GET /api/system-logs` returns `401` without a token, `403` for students, and `200` for admins, through new `requireRole`/`requireAdmin` middleware. Admin accounts are created with the `db:promote-admin` script.
- **Code splitting:** Home and Login stay in the main bundle and every other page is a lazy chunk. The main JavaScript bundle went from 87.44 kB to 80.40 kB gzipped, and non-admins never download the admin pages. Page-load timings did not change measurably; see `ai-docs/week-10.md` for the measurements.
- **Routing Analytics:** the app records `route_visit`, `navigation_failure`, and `access_denied` events through `POST /api/telemetry`, and `/admin/routing-analytics` reads them from `GET /api/system-logs`. Activity Logs leaves these records out. The page was checked against real data in MongoDB.
- **Tests:** frontend tests (63) and backend tests (37) pass, and the production build succeeds.
- **Remaining:** event create, edit, and delete APIs still require only a valid token, not the admin role, and `POST /api/telemetry` is unauthenticated.
