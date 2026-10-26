import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import api from '../api/client';
import { makeToken, mockBackend, renderApp } from './utils';

const sampleEvents = [{ _id: 'event-1', title: 'Hackathon', category: 'Technology' }];
const findRequest = (requests, key) => requests.find((r) => r.key === key);
const apiError = (status, message) => () => [status, { error: { status, message } }];

// Simulates the API being down: axios rejects without a response.
const mockNetworkDown = () => {
  api.defaults.adapter = async (config) => {
    throw new AxiosError('Network Error', 'ERR_NETWORK', config, null, undefined);
  };
};

// Holds a request open so the loading state can be observed, then resolves it.
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

const fillRegistration = async (user, { name = 'Asha Raman', email = 'asha@psna.edu' } = {}) => {
  await screen.findByRole('option', { name: 'Hackathon' });
  await user.type(screen.getByLabelText('Name'), name);
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Department'), 'Computer Science');
  await user.selectOptions(screen.getByLabelText('Year of study'), '2nd Year');
  await user.selectOptions(screen.getByLabelText('College'), 'psna');
};

describe('event registration form', () => {
  it('posts the payload the API expects and then records telemetry', async () => {
    const requests = mockBackend({
      'GET /api/events': () => [200, sampleEvents],
      'POST /api/registrations': () => [201, { id: '1' }],
      'POST /api/telemetry': () => [201, {}]
    });
    const { user } = renderApp('/register');

    await fillRegistration(user);
    await user.click(screen.getByRole('button', { name: 'Register now' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Thanks Asha Raman! Your registration for Hackathon has been received.');
    const { body } = findRequest(requests, 'POST /api/registrations');
    expect(body).toEqual({
      name: 'Asha Raman',
      email: 'asha@psna.edu',
      department: 'Computer Science',
      year: '2nd Year',
      tenantId: 'psna',
      event: 'Hackathon',
      createdAt: expect.any(String)
    });
    expect(requests.find((r) => r.key === 'POST /api/telemetry' && r.body.action === 'registered').body).toEqual({
      studentName: 'Asha Raman',
      eventName: 'Hackathon',
      action: 'registered',
      dateTime: body.createdAt,
      status: 'confirmed'
    });
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('shows "Registering…" and blocks resubmission while the request is in flight', async () => {
    const pending = deferred();
    const requests = mockBackend({
      'GET /api/events': () => [200, sampleEvents],
      'POST /api/telemetry': () => [201, {}]
    });
    const adapter = api.defaults.adapter;
    api.defaults.adapter = (config) => (config.url === '/api/registrations'
      ? pending.promise.then(() => adapter(config))
      : adapter(config));
    const { user } = renderApp('/register');

    await fillRegistration(user);
    await user.click(screen.getByRole('button', { name: 'Register now' }));

    const button = await screen.findByRole('button', { name: 'Registering…' });
    expect(button).toBeDisabled();
    pending.resolve();
    await screen.findByRole('status');
    expect(screen.getByRole('button', { name: 'Register now' })).toBeEnabled();
    expect(requests.filter((r) => r.key === 'POST /api/registrations')).toHaveLength(1);
  });

  it('shows the API message for a duplicate registration', async () => {
    mockBackend({
      'GET /api/events': () => [200, sampleEvents],
      'POST /api/registrations': apiError(409, 'This student is already registered for this event.')
    });
    const { user } = renderApp('/register');

    await fillRegistration(user);
    await user.click(screen.getByRole('button', { name: 'Register now' }));

    const message = await screen.findByRole('status');
    expect(message).toHaveTextContent('This student is already registered for this event.');
    expect(message).toHaveClass('error');
  });

  it('still confirms the registration when only telemetry fails', async () => {
    mockBackend({
      'GET /api/events': () => [200, sampleEvents],
      'POST /api/registrations': () => [201, { id: '1' }],
      'POST /api/telemetry': apiError(500, 'Internal server error.')
    });
    const { user } = renderApp('/register');

    await fillRegistration(user);
    await user.click(screen.getByRole('button', { name: 'Register now' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Thanks Asha Raman!');
  });

  it('rejects emails and names the API would reject without calling it', async () => {
    const requests = mockBackend({ 'GET /api/events': () => [200, sampleEvents] });
    const { user } = renderApp('/register');

    await fillRegistration(user, { name: 'a'.repeat(151), email: 'a@b@c.com' });
    await user.click(screen.getByRole('button', { name: 'Register now' }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Use at most 150 characters.')).toBeInTheDocument();
    expect(findRequest(requests, 'POST /api/registrations')).toBeUndefined();
  });

  it('says events could not be loaded instead of loading forever', async () => {
    mockNetworkDown();
    renderApp('/register');

    expect(await screen.findByRole('option', { name: 'Unable to load events' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register now' })).toBeDisabled();
  });

  it('says when there are no events to register for', async () => {
    mockBackend({ 'GET /api/events': () => [200, []] });
    renderApp('/register');

    expect(await screen.findByRole('option', { name: 'No events available' })).toBeInTheDocument();
  });
});

describe('create account form', () => {
  const fillAccount = async (user, fullName = 'Asha Raman') => {
    await user.type(await screen.findByLabelText(/^Full Name/), fullName);
    await user.type(screen.getByLabelText(/^Email Address/), 'asha@psna.edu');
    await user.type(screen.getByLabelText(/^Password/), 'StrongPass1');
    await user.type(screen.getByLabelText(/^Confirm Password/), 'StrongPass1');
    await user.selectOptions(screen.getByLabelText(/^College \*$/), 'psna');
  };

  it('shows the API message when the email is already registered', async () => {
    mockBackend({ 'POST /api/auth/register': apiError(409, 'An account with this email already exists for the selected college.') });
    const { user } = renderApp('/create-account');

    await fillAccount(user);
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('An account with this email already exists for the selected college.');
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeEnabled();
  });

  it('rejects a full name longer than the API allows', async () => {
    const requests = mockBackend();
    const { user } = renderApp('/create-account');

    await fillAccount(user, 'a'.repeat(151));
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByText('Use at most 150 characters.')).toBeInTheDocument();
    expect(findRequest(requests, 'POST /api/auth/register')).toBeUndefined();
  });

  it('explains when the server cannot be reached', async () => {
    mockNetworkDown();
    const { user } = renderApp('/create-account');

    await fillAccount(user);
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the CampusConnect server.');
  });
});

describe('login form', () => {
  const fillLogin = async (user) => {
    await user.type(screen.getByLabelText('Email Address'), 'asha@psna.edu');
    await user.type(screen.getByLabelText('Password'), 'StrongPass1');
    await user.selectOptions(screen.getByLabelText('College'), 'psna');
  };

  it('posts email, password and college, then shows "Logging in…" until it finishes', async () => {
    const pending = deferred();
    const requests = mockBackend({ 'POST /api/auth/login': () => [200, { token: makeToken({ role: 'student' }) }] });
    const adapter = api.defaults.adapter;
    api.defaults.adapter = (config) => pending.promise.then(() => adapter(config));
    const { user } = renderApp('/login');

    await fillLogin(user);
    await user.click(screen.getByRole('button', { name: /^login$/i }));

    expect(await screen.findByRole('button', { name: /logging in/i })).toBeDisabled();
    pending.resolve();
    await waitFor(() => expect(window.location.pathname).toBe('/'));
    expect(findRequest(requests, 'POST /api/auth/login').body)
      .toEqual({ email: 'asha@psna.edu', password: 'StrongPass1', tenantId: 'psna' });
  });

  it('explains when the server cannot be reached', async () => {
    mockNetworkDown();
    const { user } = renderApp('/login');

    await fillLogin(user);
    await user.click(screen.getByRole('button', { name: /^login$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the CampusConnect server.');
    expect(screen.getByRole('button', { name: /^login$/i })).toBeEnabled();
  });
});
