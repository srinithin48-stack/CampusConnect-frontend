import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import api from '../api/client';
import App from '../components/App';
import { AuthProvider } from '../context/AuthContext';

const base64Url = (value) => btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

export const makeToken = (claims = {}) => [
  base64Url({ alg: 'HS256', typ: 'JWT' }),
  base64Url({ userId: 1, tenantId: 'psna', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600, ...claims }),
  'test-signature'
].join('.');

export const sampleLog = {
  id: 'log-1',
  studentName: 'Priya Kumar',
  eventName: 'Hackathon',
  action: 'EVENT_REGISTERED',
  status: 'Confirmed',
  dateTime: '2026-09-01T10:00:00.000Z'
};

// Replaces axios' network layer so the real client and its interceptors still run.
// `routes` maps "METHOD /url" to (config) => [status, data]; unmatched requests return 200 [].
export function mockBackend(routes = {}) {
  const requests = [];
  api.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    requests.push({
      key,
      authorization: config.headers?.Authorization,
      body: typeof config.data === 'string' ? JSON.parse(config.data) : config.data
    });
    const [status, data] = routes[key] ? routes[key](config) : [200, []];
    const response = { status, data, statusText: String(status), headers: {}, config };
    if (status >= 400) throw new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, null, response);
    return response;
  };
  return requests;
}

export function renderApp(path = '/') {
  window.history.pushState({}, '', path);
  const user = userEvent.setup();
  return { user, ...render(<AuthProvider><App /></AuthProvider>) };
}

// Navigates the way a typed URL or back/forward would, without remounting the app.
export function goTo(path) {
  act(() => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

export async function submitLogin(user, { email = 'admin@psna.edu', password = 'correct-password', college = 'psna' } = {}) {
  await user.type(screen.getByLabelText('Email Address'), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.selectOptions(screen.getByLabelText('College'), college);
  await user.click(screen.getByRole('button', { name: /^login$/i }));
}
