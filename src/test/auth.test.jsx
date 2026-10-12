import { describe, expect, it } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import { setAuthToken } from '../api/client';
import { goTo, makeToken, mockBackend, renderApp, sampleLog, submitLogin } from './utils';

const navbar = () => within(document.querySelector('.navbar'));

const loginRoute = (token) => ({ 'POST /api/auth/login': () => [200, { token }] });
const logsRoute = { 'GET /api/system-logs': () => [200, [sampleLog]] };

describe('auth-based UI', () => {
  it('shows Login and no Logout when logged out', async () => {
    const requests = mockBackend();
    renderApp('/');
    await waitFor(() => expect(requests.some((r) => r.key === 'GET /api/events')).toBe(true));
    await act(async () => {});

    expect(navbar().getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
    expect(navbar().queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
  });

  it('logs in through AuthContext, swaps Login for Logout and sends the JWT to protected APIs', async () => {
    const token = makeToken({ role: 'admin' });
    const requests = mockBackend({ ...loginRoute(token), ...logsRoute });
    const { user } = renderApp('/login');

    await submitLogin(user);

    expect(await screen.findByRole('heading', { name: 'Admin Activity Logs' })).toBeInTheDocument();
    expect(await screen.findByText('Priya Kumar')).toBeInTheDocument();
    expect(navbar().getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    expect(navbar().queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();

    expect(requests.find((r) => r.key === 'POST /api/auth/login').body)
      .toEqual({ email: 'admin@psna.edu', password: 'correct-password', tenantId: 'psna' });
    expect(requests.find((r) => r.key === 'GET /api/system-logs').authorization).toBe(`Bearer ${token}`);
  });

  it('shows a clear error and stays logged out when the credentials are rejected', async () => {
    mockBackend({ 'POST /api/auth/login': () => [401, { error: { status: 401, message: 'Invalid email or password.' } }] });
    const { user } = renderApp('/login');

    await submitLogin(user, { password: 'wrong-password' });

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password for the selected college.');
    expect(navbar().getByRole('link', { name: 'Login' })).toBeInTheDocument();
  });

  it('rejects an expired token returned by the server', async () => {
    mockBackend(loginRoute(makeToken({ exp: Math.floor(Date.now() / 1000) - 60 })));
    const { user } = renderApp('/login');

    await submitLogin(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('The server did not return a valid token.');
    expect(navbar().queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
  });

  it('hides protected sidebar items when logged out', async () => {
    mockBackend();
    renderApp('/admin/event-management');

    const sidebar = within(await screen.findByRole('complementary', { name: 'Admin navigation' }));
    expect(sidebar.getByRole('link', { name: /Event Management/ })).toBeInTheDocument();
    expect(sidebar.queryByRole('link', { name: /Activity Logs/ })).not.toBeInTheDocument();
    expect(sidebar.queryByRole('button', { name: /Logout/ })).not.toBeInTheDocument();
  });

  it('does not expose the JWT through window globals', async () => {
    const token = makeToken();
    mockBackend({ ...loginRoute(token), ...logsRoute });
    const { user } = renderApp('/login');

    await submitLogin(user);
    await screen.findByRole('heading', { name: 'Admin Activity Logs' });

    // Skipped: Web Storage, where Week 7 keeps the token on purpose, and Vitest's worker
    // internals (serializing its RPC proxy triggers remote calls).
    const leakingGlobals = Object.getOwnPropertyNames(window).filter((key) => {
      if (key.startsWith('__vitest') || /^_?(local|session)Storage$/.test(key)) return false;
      try {
        const value = window[key];
        return typeof value === 'string' ? value.includes(token) : JSON.stringify(value)?.includes(token);
      } catch {
        return false;
      }
    });
    expect(leakingGlobals).toEqual([]);
  });
});

describe('logout', () => {
  it('clears auth state from the navbar and blocks protected pages again', async () => {
    mockBackend({ ...loginRoute(makeToken()), ...logsRoute });
    const { user } = renderApp('/login');
    await submitLogin(user);
    await screen.findByRole('heading', { name: 'Admin Activity Logs' });

    await user.click(navbar().getByRole('button', { name: 'Logout' }));

    expect(await screen.findByRole('heading', { name: 'Welcome Back!' })).toBeInTheDocument();
    expect(navbar().getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(navbar().queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();

    goTo('/admin/activity-logs');
    expect(await screen.findByRole('heading', { name: 'Welcome Back!' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    expect(window.localStorage.getItem('campusconnect.token')).toBeNull();
    expect(window.sessionStorage.getItem('campusconnect.token')).toBeNull();
  });

  it('logs out from the admin sidebar too', async () => {
    mockBackend({ ...loginRoute(makeToken()), ...logsRoute });
    const { user } = renderApp('/login');
    await submitLogin(user);
    const sidebar = within(await screen.findByRole('complementary', { name: 'Admin navigation' }));

    await user.click(sidebar.getByRole('button', { name: /Logout/ }));

    expect(await screen.findByRole('heading', { name: 'Welcome Back!' })).toBeInTheDocument();
    expect(navbar().getByRole('link', { name: 'Login' })).toBeInTheDocument();
  });

  it('logs out and redirects to login when a protected API returns 401', async () => {
    mockBackend({
      ...loginRoute(makeToken()),
      'GET /api/system-logs': () => [401, { error: { status: 401, message: 'Invalid or expired authentication token.' } }]
    });
    const { user } = renderApp('/login');

    await submitLogin(user);

    await waitFor(() => expect(window.location.pathname).toBe('/login'));
    expect(await screen.findByRole('heading', { name: 'Welcome Back!' })).toBeInTheDocument();
    expect(navbar().getByRole('link', { name: 'Login' })).toBeInTheDocument();
  });
});

describe('protected routes', () => {
  it('redirects to login without calling the protected API when logged out', async () => {
    const requests = mockBackend(logsRoute);
    renderApp('/admin/activity-logs');

    expect(await screen.findByRole('heading', { name: 'Welcome Back!' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    expect(requests.some((r) => r.key === 'GET /api/system-logs')).toBe(false);
  });

  it('returns to the originally requested page after logging in', async () => {
    mockBackend({ ...loginRoute(makeToken({ role: 'student' })), ...logsRoute });
    const { user } = renderApp('/admin/activity-logs');
    await screen.findByRole('heading', { name: 'Welcome Back!' });

    await submitLogin(user);

    expect(await screen.findByRole('heading', { name: 'Admin Activity Logs' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/admin/activity-logs');
  });
});

describe('route-state persistence', () => {
  it('keeps the user logged in across route changes without logging in again', async () => {
    const token = makeToken({ role: 'student' });
    const requests = mockBackend({ ...loginRoute(token), ...logsRoute });
    const { user } = renderApp('/login');
    await submitLogin(user);
    await waitFor(() => expect(window.location.pathname).toBe('/'));

    for (const page of ['Events', 'About', 'Contact', 'Home']) {
      await user.click(navbar().getByRole('link', { name: page }));
      expect(navbar().getByRole('button', { name: 'Logout' })).toBeInTheDocument();
      expect(navbar().queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
    }

    goTo('/admin/activity-logs');
    expect(await screen.findByRole('heading', { name: 'Admin Activity Logs' })).toBeInTheDocument();
    expect(await screen.findByText('Priya Kumar')).toBeInTheDocument();

    expect(requests.filter((r) => r.key === 'POST /api/auth/login')).toHaveLength(1);
    expect(requests.find((r) => r.key === 'GET /api/system-logs').authorization).toBe(`Bearer ${token}`);
  });
});

describe('full page reloads', () => {
  it('stays logged in when Activity Logs is opened by URL or refreshed', async () => {
    const token = makeToken({ role: 'student' });
    const requests = mockBackend({ ...loginRoute(token), ...logsRoute });
    const { user, unmount } = renderApp('/login');
    await submitLogin(user);
    await waitFor(() => expect(window.location.pathname).toBe('/'));

    // Simulate a real page load: the app and the API client start from scratch.
    unmount();
    setAuthToken(null);
    renderApp('/admin/activity-logs');

    expect(await screen.findByRole('heading', { name: 'Admin Activity Logs' })).toBeInTheDocument();
    expect(await screen.findByText('Priya Kumar')).toBeInTheDocument();
    expect(navbar().getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    expect(requests.find((r) => r.key === 'GET /api/system-logs').authorization).toBe(`Bearer ${token}`);
  });

  it('uses localStorage with Remember me and sessionStorage without it', async () => {
    const token = makeToken();
    mockBackend({ ...loginRoute(token), ...logsRoute });
    const { user } = renderApp('/login');
    await user.click(screen.getByRole('checkbox', { name: 'Remember me' }));

    await submitLogin(user);
    await screen.findByRole('heading', { name: 'Admin Activity Logs' });

    expect(window.sessionStorage.getItem('campusconnect.token')).toBe(token);
    expect(window.localStorage.getItem('campusconnect.token')).toBeNull();
  });

  it('ignores an expired saved token and asks the user to log in', async () => {
    window.localStorage.setItem('campusconnect.token', makeToken({ exp: Math.floor(Date.now() / 1000) - 60 }));
    const requests = mockBackend(logsRoute);
    renderApp('/admin/activity-logs');

    expect(await screen.findByRole('heading', { name: 'Welcome Back!' })).toBeInTheDocument();
    expect(window.localStorage.getItem('campusconnect.token')).toBeNull();
    expect(requests.some((r) => r.key === 'GET /api/system-logs')).toBe(false);
  });
});
