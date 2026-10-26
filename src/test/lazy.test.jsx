import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { mockBackend, renderApp } from './utils';

// Simulates a page chunk that fails to download (e.g. after a redeploy or a dropped connection).
vi.mock('../components/ContactPage', () => {
  throw new Error('Failed to fetch dynamically imported module: /assets/ContactPage.js');
});

describe('lazy-loaded pages', () => {
  it('shows the Suspense fallback while a page loads, then the page', async () => {
    mockBackend();
    const { user } = renderApp('/');

    await user.click(within(document.querySelector('.navbar')).getByRole('link', { name: 'About' }));

    // The About chunk has not been imported yet, so Suspense shows the fallback first.
    expect(screen.getByRole('status')).toHaveTextContent('Loading page…');
    expect(await screen.findByRole('heading', { name: 'Why CampusConnect' })).toBeInTheDocument();
    expect(screen.queryByText('Loading page…')).not.toBeInTheDocument();
  });

  it('shows a reload message and records a navigation failure when a page fails to load', async () => {
    const requests = mockBackend();
    const { user } = renderApp('/');
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await user.click(within(document.querySelector('.navbar')).getByRole('link', { name: 'Contact' }));

    expect(await screen.findByRole('heading', { name: 'This page could not be loaded.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument();
    expect(document.querySelector('.navbar')).toBeInTheDocument();
    await waitFor(() => expect(requests.filter((r) => r.key === 'POST /api/telemetry' && r.body.action === 'navigation_failure').map((r) => r.body))
      .toEqual([expect.objectContaining({ eventName: '/contact', status: 'load_error' })]));

    // Navigating away clears the error.
    await user.click(within(document.querySelector('.navbar')).getByRole('link', { name: 'Home' }));
    expect(screen.queryByRole('heading', { name: 'This page could not be loaded.' })).not.toBeInTheDocument();
  });
});
