import api from './client';

// Routing events are stored through the existing telemetry API (as SystemLog records)
// and read back by the admin Routing Analytics page from /api/system-logs.
export const ROUTE_EVENTS = {
  visit: 'route_visit',
  failure: 'navigation_failure',
  denied: 'access_denied'
};

const routeEventActions = new Set(Object.values(ROUTE_EVENTS));

export const isRouteEvent = (record) => routeEventActions.has(String(record?.action ?? '').toLowerCase());

// The API requires a name; the JWT carries no name, so use the role and user ID.
export const visitorLabel = (user) => (user ? `${user.role || 'user'} #${user.userId}` : 'Guest');

export const recordRouteEvent = async (action, { path, status, user }) => {
  try {
    await api.post('/api/telemetry', {
      studentName: visitorLabel(user),
      eventName: path,
      action,
      dateTime: new Date().toISOString(),
      status
    });
  } catch {
    // Analytics must never break navigation.
  }
};
