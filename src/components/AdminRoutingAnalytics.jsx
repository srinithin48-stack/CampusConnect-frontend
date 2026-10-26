import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { isRouteEvent, ROUTE_EVENTS } from '../api/routeAnalytics';
import AdminSidebar from './AdminSidebar';

const RANGES = [
  { value: 'all', label: 'All time', ms: Infinity },
  { value: '7d', label: 'Last 7 days', ms: 7 * 24 * 60 * 60 * 1000 },
  { value: '24h', label: 'Last 24 hours', ms: 24 * 60 * 60 * 1000 }
];

const ISSUE_LABELS = {
  [ROUTE_EVENTS.failure]: 'Navigation failure',
  [ROUTE_EVENTS.denied]: 'Access denied'
};

const STATUS_LABELS = {
  not_found: 'Not found',
  load_error: 'Load error',
  render_error: 'Render error',
  login_required: 'Login required',
  forbidden: 'Forbidden'
};

const normalizeRouteEvents = (records) => (Array.isArray(records) ? records : [])
  .filter(isRouteEvent)
  .map((record, index) => {
    const time = new Date(record.dateTime).getTime();
    return {
      id: String(record.id ?? `route-${index}`),
      action: String(record.action).toLowerCase(),
      path: typeof record.eventName === 'string' && record.eventName.trim() ? record.eventName.trim() : 'Unknown route',
      visitor: typeof record.studentName === 'string' && record.studentName.trim() ? record.studentName.trim() : 'Unknown',
      status: String(record.status ?? '').toLowerCase(),
      time: Number.isNaN(time) ? null : time
    };
  });

const formatDateTime = (time) => (time === null ? 'Not recorded' : new Date(time).toLocaleString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
}));

function AdminRoutingAnalytics() {
  const [records, setRecords] = useState([]);
  const [range, setRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    const loadRouteEvents = async () => {
      try {
        const response = await api.get('/api/system-logs');
        setRecords(normalizeRouteEvents(response.data));
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          setAuthRequired(true);
          setError('You need to log in to view routing analytics. Your session may have expired.');
        } else {
          setError('Unable to load routing analytics. Make sure the CampusConnect API server is running.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadRouteEvents();
  }, []);

  const { visits, failures, denied, topRoutes, issues } = useMemo(() => {
    const { ms } = RANGES.find((option) => option.value === range);
    const since = Date.now() - ms;
    const inRange = records.filter((record) => ms === Infinity || (record.time !== null && record.time >= since));
    const byAction = (action) => inRange.filter((record) => record.action === action);

    const visitRecords = byAction(ROUTE_EVENTS.visit);
    const counts = visitRecords.reduce((result, record) => {
      const entry = result.get(record.path) || { path: record.path, visits: 0, visitors: new Set(), lastVisit: null };
      entry.visits += 1;
      entry.visitors.add(record.visitor);
      if (record.time !== null) entry.lastVisit = Math.max(entry.lastVisit ?? record.time, record.time);
      return result.set(record.path, entry);
    }, new Map());

    return {
      visits: visitRecords.length,
      failures: byAction(ROUTE_EVENTS.failure).length,
      denied: byAction(ROUTE_EVENTS.denied).length,
      topRoutes: [...counts.values()].sort((a, b) => b.visits - a.visits || a.path.localeCompare(b.path)),
      issues: inRange
        .filter((record) => record.action !== ROUTE_EVENTS.visit)
        .sort((a, b) => (b.time ?? 0) - (a.time ?? 0))
    };
  }, [records, range]);

  const stats = [
    { label: 'Route visits', value: visits },
    { label: 'Navigation failures', value: failures },
    { label: 'Access denied', value: denied }
  ];

  return (
    <div className="admin-event-shell">
      <header className="admin-topbar">
        <div className="admin-brand"><span>CC</span> CampusConnect</div>
        <div className="admin-profile"><span aria-hidden="true">♧</span><strong>A</strong><span>Admin⌄</span></div>
      </header>
      <div className="admin-layout admin-reference-layout">
        <AdminSidebar />
        <section className="admin-logs" aria-labelledby="routing-analytics-heading">
          <header className="admin-logs-header">
            <span className="admin-heading-icon" aria-hidden="true">◫</span>
            <div>
              <h2 id="routing-analytics-heading">Routing Analytics</h2>
              <p className="page-intro">Recorded page visits, navigation failures, and blocked access attempts.</p>
            </div>
          </header>

          <div className="admin-log-controls">
            <select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Filter routing analytics by time range">
              {RANGES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          {loading && <p className="admin-state">Loading routing analytics…</p>}
          {error && (
            <p className="admin-state error">
              {error}
              {authRequired && <> <Link to="/login" state={{ from: '/admin/routing-analytics' }}>Log in</Link></>}
            </p>
          )}

          {!loading && !error && (
            <>
              <dl className="routing-stats">
                {stats.map((stat) => (
                  <div key={stat.label} className="routing-stat">
                    <dt>{stat.label}</dt>
                    <dd>{stat.value}</dd>
                  </div>
                ))}
              </dl>

              <h3 className="routing-section-title">Visits by route</h3>
              {topRoutes.length === 0 ? (
                <p className="admin-state">No route visits recorded for this time range.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table aria-label="Visits by route">
                    <thead><tr><th>Route</th><th>Visits</th><th>Unique visitors</th><th>Last visit</th></tr></thead>
                    <tbody>
                      {topRoutes.map((route) => (
                        <tr key={route.path}>
                          <td>{route.path}</td><td>{route.visits}</td><td>{route.visitors.size}</td><td>{formatDateTime(route.lastVisit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h3 className="routing-section-title">Navigation failures and access denied</h3>
              {issues.length === 0 ? (
                <p className="admin-state">No navigation failures or access-denied events recorded for this time range.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table aria-label="Navigation failures and access denied">
                    <thead><tr><th>Type</th><th>Route</th><th>Reason</th><th>Visitor</th><th>Date/Time</th></tr></thead>
                    <tbody>
                      {issues.map((issue) => (
                        <tr key={issue.id}>
                          <td>{ISSUE_LABELS[issue.action]}</td>
                          <td>{issue.path}</td>
                          <td><span className="log-status" data-status={issue.action === ROUTE_EVENTS.denied ? 'pending' : 'failed'}>{STATUS_LABELS[issue.status] || issue.status || 'Unknown'}</span></td>
                          <td>{issue.visitor}</td>
                          <td>{formatDateTime(issue.time)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminRoutingAnalytics;
