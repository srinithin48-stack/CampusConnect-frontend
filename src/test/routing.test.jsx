import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { goTo, makeToken, mockBackend, renderApp, sampleLog } from './utils';

const ADMIN_PATHS = ['/admin/activity-logs', '/admin/routing-analytics', '/admin/events', '/admin/event-management'];

const loginAs = (role) => window.localStorage.setItem('campusconnect.token', makeToken({ role, userId: 7 }));
const routeEvents = (requests, action) => requests
  .filter((r) => r.key === 'POST /api/telemetry' && r.body.action === action)
  .map((r) => r.body);

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString();
const routeLog = (id, action, path, status, dateTime = minutesAgo(5), studentName = 'student #7') => (
  { id, action, eventName: path, status, dateTime, studentName }
);

describe('role-based route protection', () => {
  it.each(ADMIN_PATHS)('sends logged-out visitors from %s to Login and records the denial', async (path) => {
    const requests = mockBackend();
    renderApp(path);

    expect(await screen.findByRole('heading', { name: 'Welcome Back!' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    await waitFor(() => expect(routeEvents(requests, 'access_denied')).toEqual([
      expect.objectContaining({ eventName: path, status: 'login_required', studentName: 'Guest' })
    ]));
    expect(requests.some((r) => r.key === 'GET /api/system-logs')).toBe(false);
  });

  it.each(ADMIN_PATHS)('blocks a student from %s and shows Access denied', async (path) => {
    loginAs('student');
    const requests = mockBackend();
    renderApp(path);

    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/access-denied');
    expect(screen.getByText(path)).toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: 'Admin navigation' })).not.toBeInTheDocument();
    await waitFor(() => expect(routeEvents(requests, 'access_denied')).toEqual([
      expect.objectContaining({ eventName: path, status: 'forbidden', studentName: 'student #7' })
    ]));
    expect(requests.some((r) => r.key === 'GET /api/system-logs')).toBe(false);
  });

  it('also blocks staff accounts, which are not admins', async () => {
    loginAs('staff');
    mockBackend();
    renderApp('/admin/activity-logs');

    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
  });

  it('sends a student who logs in from an admin page to Access denied, not the admin page', async () => {
    const requests = mockBackend({ 'POST /api/auth/login': () => [200, { token: makeToken({ role: 'student' }) }] });
    const { user } = renderApp('/admin/routing-analytics');
    await screen.findByRole('heading', { name: 'Welcome Back!' });

    await user.type(screen.getByLabelText('Email Address'), 'student@psna.edu');
    await user.type(screen.getByLabelText('Password'), 'correct-password');
    await user.selectOptions(screen.getByLabelText('College'), 'psna');
    await user.click(screen.getByRole('button', { name: /^login$/i }));

    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
    expect(requests.some((r) => r.key === 'GET /api/system-logs')).toBe(false);
  });

  it.each([
    ['/admin/activity-logs', 'Admin Activity Logs'],
    ['/admin/routing-analytics', 'Routing Analytics'],
    ['/admin/events', 'Event Management'],
    ['/admin/event-management', 'Event Management']
  ])('lets an admin open %s', async (path, heading) => {
    loginAs('admin');
    mockBackend();
    renderApp(path);

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    expect(window.location.pathname).toBe(path);
  });

  it('links to Routing Analytics from the admin sidebar', async () => {
    loginAs('admin');
    mockBackend();
    const { user } = renderApp('/admin/activity-logs');

    const sidebar = within(await screen.findByRole('complementary', { name: 'Admin navigation' }));
    await user.click(sidebar.getByRole('link', { name: /Routing Analytics/ }));

    expect(await screen.findByRole('heading', { name: 'Routing Analytics' })).toBeInTheDocument();
  });
});

describe('route event recording', () => {
  it('records each settled page visit, but not guarded paths that redirect', async () => {
    const requests = mockBackend();
    const { user } = renderApp('/');
    await waitFor(() => expect(routeEvents(requests, 'route_visit')).toHaveLength(1));

    await user.click(within(document.querySelector('.navbar')).getByRole('link', { name: 'Events' }));
    await screen.findByRole('heading', { name: 'Events' });
    goTo('/admin/activity-logs');
    await screen.findByRole('heading', { name: 'Welcome Back!' });

    await waitFor(() => expect(routeEvents(requests, 'route_visit').map((e) => e.eventName)).toEqual(['/', '/events', '/login']));
    expect(routeEvents(requests, 'route_visit')[0]).toEqual({
      studentName: 'Guest', eventName: '/', action: 'route_visit', dateTime: expect.any(String), status: 'success'
    });
  });

  it('records an unknown path as a navigation failure and still redirects Home', async () => {
    const requests = mockBackend();
    renderApp('/no-such-page');

    await waitFor(() => expect(window.location.pathname).toBe('/'));
    await waitFor(() => expect(routeEvents(requests, 'navigation_failure')).toEqual([
      expect.objectContaining({ eventName: '/no-such-page', status: 'not_found' })
    ]));
    expect(routeEvents(requests, 'route_visit').map((e) => e.eventName)).not.toContain('/no-such-page');
  });

  it('keeps navigating when the analytics request fails', async () => {
    mockBackend({ 'POST /api/telemetry': () => [500, { error: { status: 500, message: 'Internal server error.' } }] });
    const { user } = renderApp('/');

    await user.click(within(document.querySelector('.navbar')).getByRole('link', { name: 'About' }));

    await waitFor(() => expect(window.location.pathname).toBe('/about'));
    expect(await screen.findByRole('heading', { name: 'Why CampusConnect' })).toBeInTheDocument();
  });
});

describe('Routing Analytics page', () => {
  const logs = [
    routeLog('v1', 'route_visit', '/events', 'success'),
    routeLog('v2', 'route_visit', '/events', 'success', minutesAgo(3), 'Guest'),
    routeLog('v3', 'route_visit', '/', 'success'),
    routeLog('v-old', 'route_visit', '/about', 'success', new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()),
    routeLog('f1', 'navigation_failure', '/missing', 'not_found', minutesAgo(2)),
    routeLog('d1', 'access_denied', '/admin/activity-logs', 'forbidden', minutesAgo(1)),
    sampleLog
  ];

  it('summarises the recorded route events from the system logs API', async () => {
    loginAs('admin');
    const requests = mockBackend({ 'GET /api/system-logs': () => [200, logs] });
    renderApp('/admin/routing-analytics');

    await screen.findByText('Route visits');
    const stat = (label) => within(document.querySelector('.routing-stats')).getByText(label).nextSibling;
    expect(stat('Route visits')).toHaveTextContent('4');
    expect(stat('Navigation failures')).toHaveTextContent('1');
    expect(stat('Access denied')).toHaveTextContent('1');

    const routes = within(screen.getByRole('table', { name: 'Visits by route' })).getAllByRole('row').slice(1);
    expect(routes.map((row) => [...row.cells].slice(0, 3).map((cell) => cell.textContent))).toEqual([
      ['/events', '2', '2'],
      ['/', '1', '1'],
      ['/about', '1', '1']
    ]);

    const issues = within(screen.getByRole('table', { name: 'Navigation failures and access denied' })).getAllByRole('row').slice(1);
    expect(issues.map((row) => [...row.cells].slice(0, 3).map((cell) => cell.textContent))).toEqual([
      ['Access denied', '/admin/activity-logs', 'Forbidden'],
      ['Navigation failure', '/missing', 'Not found']
    ]);
    expect(screen.queryByText('Priya Kumar')).not.toBeInTheDocument();
    expect(requests.find((r) => r.key === 'GET /api/system-logs').authorization).toMatch(/^Bearer /);
  });

  it('filters by time range', async () => {
    loginAs('admin');
    mockBackend({ 'GET /api/system-logs': () => [200, logs] });
    const { user } = renderApp('/admin/routing-analytics');
    await screen.findByText('Route visits');

    await user.selectOptions(screen.getByLabelText('Filter routing analytics by time range'), 'Last 7 days');

    expect(screen.getByText('Route visits').nextSibling).toHaveTextContent('3');
    expect(within(screen.getByRole('table', { name: 'Visits by route' })).queryByText('/about')).not.toBeInTheDocument();
  });

  it('shows empty states when nothing has been recorded', async () => {
    loginAs('admin');
    mockBackend({ 'GET /api/system-logs': () => [200, [sampleLog]] });
    renderApp('/admin/routing-analytics');

    expect(await screen.findByText('No route visits recorded for this time range.')).toBeInTheDocument();
    expect(screen.getByText('No navigation failures or access-denied events recorded for this time range.')).toBeInTheDocument();
  });

  it('shows an error when the API is unavailable', async () => {
    loginAs('admin');
    mockBackend({ 'GET /api/system-logs': () => [500, { error: { status: 500, message: 'Internal server error.' } }] });
    renderApp('/admin/routing-analytics');

    expect(await screen.findByText(/Unable to load routing analytics/)).toBeInTheDocument();
  });

  it('keeps routing events out of Admin Activity Logs', async () => {
    loginAs('admin');
    mockBackend({ 'GET /api/system-logs': () => [200, logs] });
    renderApp('/admin/activity-logs');

    expect(await screen.findByText('Priya Kumar')).toBeInTheDocument();
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(1);
  });
});
