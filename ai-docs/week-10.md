# Week 10 - Protected routes, code splitting, and Routing Analytics

All numbers below come from runs on 2026-10-22, on the development machine (Windows 11, Node 22.14.0, Vite 5.4.21, Microsoft Edge in headless mode). Nothing in this document is estimated.

## 1. Protected routes and role-based redirects

`ProtectedRoute` now takes a `roles` list. Every admin route uses `roles={['admin']}`.

| Visitor | Opens an admin page | Result |
|---|---|---|
| Logged out | `/admin/activity-logs`, `/admin/routing-analytics`, `/admin/events`, `/admin/event-management` | Redirected to `/login`. After logging in, the user returns to the requested page. |
| Logged in as `student` or `staff` | Any admin page | Redirected to the new `/access-denied` page, which names the blocked path. No admin API is called. |
| Logged in as `admin` | Any admin page | The page opens. |

Changes from Week 9:
- **Event Management is now protected.** `/admin/events` and `/admin/event-management` were previously open to anyone, although the API already required a token to create, edit, or delete events.
- **Activity Logs is now admin-only.** Before, any logged-in user could open it.
- **The role is read from the JWT** that `AuthContext` already decodes.
- **The backend now checks the role for system logs.** A separate backend change added `requireAdmin` to `GET /api/system-logs`, which returns `403` for students (see the backend's `ai-docs/prompt-tests.md`). The live verification in section 6 was run before that change. The event write APIs still check only the token. See Limitations.

## 2. Lazy loading, Suspense, and code splitting

| In the main bundle (eager) | Reason |
|---|---|
| `Home` | The landing page, so it is needed on first paint. |
| `LoginPage` | Every guarded route redirects here. |
| `Navbar`, `Footer`, `AuthContext`, Axios client | Present on every page. |

| Lazy chunks | Loaded when |
|---|---|
| `EventsPage`, `AboutPage`, `RegisterPage`, `ContactPage`, `CreateAccountPage` | The page is first opened, or earlier by the idle prefetch described below. |
| `AdminActivityLogs`, `AdminEventManagement`, `AdminRoutingAnalytics` (with the shared `AdminSidebar` chunk), `AccessDeniedPage` | Only when the page is opened. Non-admins never download them. |

How it works:
- **`Suspense`** wraps the routes and shows "Loading page…" while a chunk downloads. The navbar and footer stay on screen.
- **`RouteErrorBoundary`** catches a chunk that fails to download, for example after a redeploy or a dropped connection. It shows "This page could not be loaded" with a Reload button and records a `navigation_failure` with status `load_error`. It resets when the user navigates to another path.
- **Idle prefetch.** The first measurements showed that the first click from Home to Events took about 655 ms on Fast 3G, against about 30 ms before, because the chunk downloaded on click. The Router now waits for the window `load` event and then for browser idle time (or 2 s), and downloads the five public page chunks in the background. Admin chunks are never prefetched.

## 3. Routing Analytics (`/admin/routing-analytics`, admin only)

Only existing APIs are used, and the backend is unchanged.

**Recording.** The frontend sends each event with `POST /api/telemetry`, which stores it as a MongoDB SystemLog:

| Field | Value |
|---|---|
| `action` | `route_visit`, `navigation_failure`, or `access_denied` |
| `eventName` | The path |
| `status` | `success`, `not_found`, `load_error`, `render_error`, `login_required`, or `forbidden` |
| `studentName` | `role #userId`, or `Guest` when logged out |

**What triggers each event**

- **Route visit:** recorded by `RouteTracker` once the location settles. Paths that a guard redirects away from are not counted as visits.
- **Navigation failure:**
  - An unknown URL records `not_found`. It still redirects Home, as before.
  - A page chunk that fails to load records `load_error`.
  - A page that throws while rendering records `render_error`.
- **Access denied:** recorded by `ProtectedRoute`, either as `login_required` (logged out) or `forbidden` (wrong role).
- **Duplicates:** a ref keyed on the location keeps React StrictMode's double effect run in development from recording one event twice.
- **Failures are ignored:** if an analytics request fails, the error is swallowed so navigation is never affected.

**Reading.** The page loads `GET /api/system-logs` with the admin's token and keeps only the three routing actions. It shows:
- Totals for each event type.
- A "Visits by route" table with visits, unique visitors, and last visit.
- A table of failures and access-denied events, newest first.
- A time-range filter (All time, Last 7 days, Last 24 hours), plus loading, error, and empty states.

There is no sample or placeholder data. With no recorded events, the page shows its empty states.

**Admin Activity Logs is unchanged**, except that it now filters out the three routing actions so that page visits don't fill its table. It also gets a "Routing Analytics" link in the admin sidebar.

## 4. Tests

Command: `npm test` (Vitest 2.1.9 with jsdom).

**Result: 5 test files, 63 tests, 63 passed, 0 failed (18.0 s), with no unhandled errors.** That is the final run, on the finished code. The same 63 tests also passed twice before the idle prefetch was added.

| File | Tests | Covers |
|---|---|---|
| `src/test/routing.test.jsx` (new) | 23 | Logged-out redirect to Login for all four admin paths, with the denial recorded and no admin API called. Student blocked on all four paths, with the Access Denied page and the denial recorded. Staff blocked. Student logging in from an admin page. Admin can open all four paths. Sidebar link. Route visits recorded without counting guarded source paths. Unknown path recorded as `not_found` and redirected Home. Navigation still works when analytics fails. Analytics totals and tables computed from API data, with unrelated logs ignored. Time-range filter. Empty and error states. Activity Logs excludes routing events. |
| `src/test/lazy.test.jsx` (new) | 2 | The Suspense fallback appears and is then replaced by the page. A chunk that fails to load shows the reload message, records `load_error`, and clears after navigating away. |
| `src/test/auth.test.jsx` | 15 | Existing tests. 4 were updated, as described below. |
| `src/test/college.test.jsx` | 11 | Existing tests. One line changed, as described below. |
| `src/test/integration.test.jsx` | 12 | Existing tests. Two lines changed, as described below. |

Existing tests that had to change:
- **Behaviour changed on purpose (4 tests in `auth.test.jsx`).**
  - "Hides protected sidebar items when logged out" opened `/admin/event-management` while logged out and expected the admin sidebar. It now expects a redirect to Login.
  - Three tests opened Activity Logs as a `student`. They now log in as `admin`, because students are blocked.
- **Timing only.**
  - The Create Account tests now wait for the lazy page with `findByLabelText` before typing.
  - One registration test now looks for the telemetry request whose action is `registered`, because a route-visit request is now sent first.

Production build (`npm run build`): it succeeds with 120 modules transformed.

## 5. Performance measurements

### 5.1 Production bundle sizes (`vite build`)

| File | Before (commit `7778f26`) | After (Week 10) |
|---|---|---|
| Main JS `index-*.js` | 271.91 kB (gzip 87.44 kB) | 240.84 kB (gzip 80.40 kB) |
| CSS `index-*.css` | 87.05 kB (gzip 15.56 kB) | 88.01 kB (gzip 15.77 kB) |
| `AdminEventManagement` | in main bundle | 10.56 kB (gzip 3.18 kB) |
| `RegisterPage` | in main bundle | 6.81 kB (gzip 2.40 kB) |
| `AdminRoutingAnalytics` (new) | n/a | 5.63 kB (gzip 2.09 kB) |
| `CreateAccountPage` | in main bundle | 5.05 kB (gzip 1.93 kB) |
| `ContactPage` | in main bundle | 4.60 kB (gzip 1.72 kB) |
| `AdminActivityLogs` | in main bundle | 3.85 kB (gzip 1.58 kB) |
| `EventsPage` | in main bundle | 2.88 kB (gzip 1.17 kB) |
| `AboutPage` | in main bundle | 1.97 kB (gzip 0.83 kB) |
| `AdminSidebar` (shared by admin pages) | in main bundle | 0.99 kB (gzip 0.44 kB) |
| `AccessDeniedPage` (new) | n/a | 0.63 kB (gzip 0.38 kB) |

- **Main bundle:** 31.1 kB smaller (11.4%), or 7.0 kB smaller gzipped (8.0%), even though it now also contains the routing and analytics code.
- **Main bundle contents:** most of the remaining ~80 kB gzip is React, ReactDOM, React Router, and Axios, which every page needs.
- **Rebuilding:** the baseline was rebuilt from a clean copy of commit `7778f26` and produced the same file hashes as the original baseline build.

### 5.2 Page-load timings in a real browser

**Method**
- **Builds:** the baseline and the Week 10 production builds were each served with `vite preview`, which serves gzip.
- **Tool:** a `puppeteer-core` script drove headless Microsoft Edge.
- **Isolation:** each run used a fresh browser context with the cache disabled.
- **Throttling:** the Chrome DevTools "Fast 3G" network profile (562.5 ms latency, 1.44 Mbps down) with a 4× CPU slowdown.
- **API stub:** API calls were answered by a fixed stub, so backend timing didn't affect the results and the runs didn't write analytics records.
- **Runs:** each scenario had 1 discarded warm-up run, then 7 measured runs. Tables show the median, with [min–max].

**First run discarded.** In the first run, the baseline was measured first, and its numbers were 1–3 s worse than in every later run of the same build. That was a warm-up and ordering effect, not a real difference, so it is not reported. The runs below were measured in the order after, then before.

**Final run (with idle prefetch)**

| Scenario | Metric | Before | After |
|---|---|---|---|
| `/` initial load | JS transferred | 85.8 kB (1 file) | 78.9 kB (1 file) |
| | First Contentful Paint | 2168 ms [2108–2240] | 2312 ms [2168–2488] |
| | DOMContentLoaded | 1818 ms [1806–1859] | 1839 ms [1796–1878] |
| `/login` initial load | First Contentful Paint | 2156 ms [2104–2180] | 2180 ms [2104–2324] |
| | DOMContentLoaded | 1841 ms [1805–1858] | 1813 ms [1783–1820] |
| `/events` initial load | First Contentful Paint | 2132 ms [2112–2204] | 1988 ms [1964–2024] |
| | DOMContentLoaded | 1826 ms [1812–1876] | 1795 ms [1782–1827] |
| Home → Events click, immediately after `load` | Time until the Events heading renders | 28 ms [27–45] | 644 ms [637–664] |
| Home → Events click, 3 s after `load` | Time until the Events heading renders | 34 ms [29–52] | 79 ms [74–102] |
| `/` unthrottled | First Contentful Paint | 128 ms [116–144] | 124 ms [112–132] |
| | JS after the page settles, including prefetch | 85.8 kB (1 file) | 88.6 kB (6 files) |

**Run before idle prefetch was added (same method)**

| Scenario | Before | After |
|---|---|---|
| Home → Events click, immediately after `load` | 29.7 ms [28–35] | 655.4 ms [637–679] |

**Reading the results**
- **Initial JS is the only clear improvement.** Every page downloads 6.9 kB less JavaScript (8%) before it can render. The 7.3 kB gzip of admin code is never downloaded by students, staff, or visitors.
- **Load timings did not change measurably.** The FCP and DOMContentLoaded ranges overlap between before and after in both runs. At this app's size, 7 kB is roughly 40 ms on Fast 3G, which is within run-to-run variation. This work should not be described as making pages load faster.
- **Navigation has a real cost.** Lazy loading makes the first visit to a page depend on the network.
  - Without prefetch, the first click to Events took about 655 ms on Fast 3G.
  - With idle prefetch and a click 3 s after load, it takes 79 ms with no network request. The remaining ~45 ms over the baseline is the Suspense round-trip and render time under the 4× CPU slowdown.
  - A click within about the first second after `load` still waits for the download.
- **Total JS after prefetch is 2.8 kB higher** than before (88.6 kB vs 85.8 kB), because the code is now split into chunks.

## 6. Live verification against the real backend

**Setup**
- The real Express API used the local MySQL and MongoDB.
- The Vite **dev** server was used, so React StrictMode was on.
- Headless Edge ran with no API stubbing.
- A fresh test account, `w10live1792610589@psna.edu` (user 107, college PSNA), was created through `POST /api/auth/register`.
- Before the run, there were no routing records in MongoDB.

**As a student**

| Step | Landed on |
|---|---|
| Opened `/admin/routing-analytics` while logged out | `/login` |
| Logged in as the student | `/access-denied` |
| Clicked Events in the navbar | `/events` |
| Opened `/no-such-page` | `/` |
| Typed `/admin/activity-logs` | `/access-denied` |

The browser sent exactly 9 telemetry POSTs, and MongoDB then held exactly those 9 records:

| Action | Path | Status | Visitor |
|---|---|---|---|
| `access_denied` | `/admin/routing-analytics` | `login_required` | Guest |
| `route_visit` | `/login` | `success` | Guest |
| `access_denied` | `/admin/routing-analytics` | `forbidden` | student #107 |
| `route_visit` | `/access-denied` | `success` | student #107 |
| `route_visit` | `/events` | `success` | student #107 |
| `navigation_failure` | `/no-such-page` | `not_found` | student #107 |
| `route_visit` | `/` | `success` | student #107 |
| `access_denied` | `/admin/activity-logs` | `forbidden` | student #107 |
| `route_visit` | `/access-denied` | `success` | student #107 |

What this showed:
- **No duplicates** under StrictMode.
- **Blocked paths are not counted as visits:** `/admin/*` and `/no-such-page` never appear as `route_visit`.

**As an admin**

There are no admin accounts in the database (sign-up always creates students), so the test account was set to `role='admin'` in MySQL for this step and set back to `student` immediately afterwards. The database again has 20 users, all students.

| Step | Result |
|---|---|
| Logged in as the admin | Landed on `/admin/activity-logs`. The table showed 51 rows, none of them routing events. |
| Clicked Routing Analytics in the sidebar | Showed Route visits 8, Navigation failures 1, Access denied 3. |

These totals match the 12 routing records in MongoDB at that point: the 9 above plus 3 admin-phase visits. The failures table listed the 4 issues newest first, with the correct reasons and visitors.

**Test data left in the local database**
- The account `w10live1792610589@psna.edu`, now a student.
- The 12 routing SystemLog records described above.

## 7. Limitations and follow-ups

- **The event write APIs do not enforce roles.** `GET /api/system-logs` is now admin-only on the backend (`403` for students), but `POST`, `PUT`, and `DELETE /api/events` still only check that a token is valid. A student calling the API directly could still change events. A follow-up should add `requireAdmin` to those routes.
- **`POST /api/telemetry` is unauthenticated,** so anyone can post fake routing records. A follow-up could use a dedicated route-analytics endpoint that records the user from the token.
- **Visitor identity is coarse.** The JWT has no name, so visitors are labelled `role #userId`, and all logged-out visitors share the label `Guest`. That means "Unique visitors" counts all guests as one.
- **`GET /api/system-logs` returns every record with no paging.** Recording every page visit will make that response grow over time, for both Activity Logs and Routing Analytics. Server-side filtering or paging will be needed eventually.
- **Sign-up only creates students.** Admin accounts are created with the backend's `npm --prefix backend run db:promote-admin -- <email> [tenantId]` script, which was added after the live verification in section 6.
