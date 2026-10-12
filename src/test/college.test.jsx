import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { OTHER_COLLEGE, resolveCollegeTenantId, validateCollegeName } from '../api/colleges';
import { makeToken, mockBackend, renderApp } from './utils';

const OTHER_LABEL = '+ Add Other College';
const sampleEvents = [{ _id: 'event-1', title: 'Hackathon', category: 'Technology' }];

const findRequest = (requests, key) => requests.find((r) => r.key === key);

describe('college name helpers', () => {
  it('validates typed college names', () => {
    expect(validateCollegeName('   ')).toBe('Enter your college name.');
    expect(validateCollegeName('A')).toBe('Use at least 2 characters.');
    expect(validateCollegeName('x'.repeat(151))).toBe('Use at most 150 characters.');
    expect(validateCollegeName('Hack<script>')).toMatch(/^Use only letters/);
    expect(validateCollegeName('123 456')).toBe('College name must contain letters.');
    expect(validateCollegeName("St. Joseph's College of Arts & Science (Autonomous)")).toBe('');
  });

  it('sends the typed name for "Other" and the dropdown ID otherwise', () => {
    expect(resolveCollegeTenantId(OTHER_COLLEGE, '  Sri   Sairam Engineering College ')).toBe('Sri Sairam Engineering College');
    expect(resolveCollegeTenantId('psna', 'ignored')).toBe('psna');
  });
});

describe('login college selection', () => {
  const collegeSelect = () => screen.getByLabelText('College');

  it('keeps the existing colleges and adds "+ Add Other College"', () => {
    mockBackend();
    renderApp('/login');

    expect(screen.getByRole('option', { name: 'PSNA College of Engineering and Technology' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: OTHER_LABEL })).toHaveValue(OTHER_COLLEGE);
    expect(screen.queryByLabelText('College Name')).not.toBeInTheDocument();
  });

  it('logs in with a typed college name', async () => {
    const requests = mockBackend({ 'POST /api/auth/login': () => [200, { token: makeToken({ role: 'student', tenantId: 42 }) }] });
    const { user } = renderApp('/login');

    await user.type(screen.getByLabelText('Email Address'), 'student@sairam.edu');
    await user.type(screen.getByLabelText('Password'), 'correct-password');
    await user.selectOptions(collegeSelect(), OTHER_LABEL);
    await user.type(screen.getByLabelText('College Name'), '  Sri   Sairam Engineering College ');
    await user.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => expect(window.location.pathname).toBe('/'));
    expect(findRequest(requests, 'POST /api/auth/login').body)
      .toEqual({ email: 'student@sairam.edu', password: 'correct-password', tenantId: 'Sri Sairam Engineering College' });
  });

  it('requires a valid college name before calling the API', async () => {
    const requests = mockBackend();
    const { user } = renderApp('/login');

    await user.type(screen.getByLabelText('Email Address'), 'student@sairam.edu');
    await user.type(screen.getByLabelText('Password'), 'correct-password');
    await user.selectOptions(collegeSelect(), OTHER_LABEL);
    await user.click(screen.getByRole('button', { name: /^login$/i }));

    expect(await screen.findByText('Enter your college name.')).toBeInTheDocument();
    expect(findRequest(requests, 'POST /api/auth/login')).toBeUndefined();
  });
});

describe('create account college selection', () => {
  const fillAccount = async (user) => {
    await user.type(screen.getByLabelText(/^Full Name/), 'Asha Raman');
    await user.type(screen.getByLabelText(/^Email Address/), 'asha@sairam.edu');
    await user.type(screen.getByLabelText(/^Password/), 'StrongPass1');
    await user.type(screen.getByLabelText(/^Confirm Password/), 'StrongPass1');
  };
  const collegeSelect = () => screen.getByLabelText(/^College \*$/);

  it('creates an account for a typed college name', async () => {
    const requests = mockBackend({ 'POST /api/auth/register': () => [201, { id: 7, tenantId: 42 }] });
    const { user } = renderApp('/create-account');

    await fillAccount(user);
    await user.selectOptions(collegeSelect(), OTHER_LABEL);
    await user.type(screen.getByLabelText(/^College Name/), 'Sri Sairam Engineering College');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Account created! Please log in.');
    expect(findRequest(requests, 'POST /api/auth/register').body).toEqual({
      fullName: 'Asha Raman',
      email: 'asha@sairam.edu',
      password: 'StrongPass1',
      tenantId: 'Sri Sairam Engineering College'
    });
  });

  it('rejects an invalid college name without calling the API', async () => {
    const requests = mockBackend();
    const { user } = renderApp('/create-account');

    await fillAccount(user);
    await user.selectOptions(collegeSelect(), OTHER_LABEL);
    await user.type(screen.getByLabelText(/^College Name/), '<b>College</b>');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByText(/^Use only letters/)).toBeInTheDocument();
    expect(findRequest(requests, 'POST /api/auth/register')).toBeUndefined();
  });

  it('still sends the dropdown college ID for listed colleges', async () => {
    const requests = mockBackend({ 'POST /api/auth/register': () => [201, {}] });
    const { user } = renderApp('/create-account');

    await fillAccount(user);
    await user.selectOptions(collegeSelect(), 'psg');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await screen.findByRole('heading', { name: 'Welcome Back!' });
    expect(findRequest(requests, 'POST /api/auth/register').body.tenantId).toBe('psg');
  });
});

describe('event registration college selection', () => {
  const fillRegistration = async (user) => {
    await screen.findByRole('option', { name: 'Hackathon' });
    await user.type(screen.getByLabelText('Name'), 'Asha Raman');
    await user.type(screen.getByLabelText('Email'), 'asha@sairam.edu');
    await user.type(screen.getByLabelText('Department'), 'Computer Science');
    await user.selectOptions(screen.getByLabelText('Year of study'), '2nd Year');
  };
  const registerRoutes = {
    'GET /api/events': () => [200, sampleEvents],
    'POST /api/registrations': () => [201, {}],
    'POST /api/telemetry': () => [201, {}]
  };

  it('registers with a typed college name', async () => {
    const requests = mockBackend(registerRoutes);
    const { user } = renderApp('/register');

    await fillRegistration(user);
    await user.selectOptions(screen.getByLabelText('College'), OTHER_LABEL);
    await user.type(screen.getByLabelText('College name'), 'Sri Sairam Engineering College');
    await user.click(screen.getByRole('button', { name: 'Register now' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Thanks Asha Raman!');
    const { body } = findRequest(requests, 'POST /api/registrations');
    expect(body).toMatchObject({ tenantId: 'Sri Sairam Engineering College', event: 'Hackathon' });
    expect(body).not.toHaveProperty('collegeName');
  });

  it('requires a college name when "+ Add Other College" is selected', async () => {
    const requests = mockBackend(registerRoutes);
    const { user } = renderApp('/register');

    await fillRegistration(user);
    await user.selectOptions(screen.getByLabelText('College'), OTHER_LABEL);
    await user.click(screen.getByRole('button', { name: 'Register now' }));

    expect(await screen.findByText('Enter your college name.')).toBeInTheDocument();
    expect(findRequest(requests, 'POST /api/registrations')).toBeUndefined();
  });

  it('still sends the dropdown college ID for listed colleges', async () => {
    const requests = mockBackend(registerRoutes);
    const { user } = renderApp('/register');

    await fillRegistration(user);
    await user.selectOptions(screen.getByLabelText('College'), 'vit');
    await user.click(screen.getByRole('button', { name: 'Register now' }));

    await screen.findByRole('status');
    expect(findRequest(requests, 'POST /api/registrations').body.tenantId).toBe('vit');
  });
});
