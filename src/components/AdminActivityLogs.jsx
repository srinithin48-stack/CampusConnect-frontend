import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const cleanText = (value, fallback) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || fallback;
};

const normalizeLabel = (value, fallback) => {
  const text = cleanText(value, fallback);
  return text === fallback ? text : text.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const normalizeTelemetry = (records) => records
  .filter((record) => record && typeof record === 'object')
  .map((record, index) => ({
    id: cleanText(String(record.id ?? ''), `telemetry-${index}`),
    student: cleanText(record.student?.name ?? record.studentName, 'Unknown student'),
    event: cleanText(record.event?.title ?? record.eventName, 'Unknown event'),
    action: normalizeLabel(record.action, 'Unknown action'),
    dateTime: cleanText(record.timestamp ?? record.dateTime, 'Not recorded'),
    status: normalizeLabel(record.status, 'Unknown')
  }));

function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTelemetry = async () => {
      try {
        const response = await api.get('/telemetry');
        setLogs(normalizeTelemetry(response.data));
      } catch {
        setError('Unable to load activity logs. Start JSON Server and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTelemetry();
  }, []);

  const statuses = ['All', ...new Set(logs.map((log) => log.status))];
  const visibleLogs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesSearch = `${log.student} ${log.event} ${log.action}`.toLowerCase().includes(term);
      return matchesSearch && (statusFilter === 'All' || log.status === statusFilter);
    });
  }, [logs, searchTerm, statusFilter]);

  const formatDateTime = (value) => {
    if (value === 'Not recorded') return value;
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
  };

  return (
    <section className="admin-logs" aria-labelledby="activity-logs-heading">
      <div className="section-heading highlight">
        <h2 id="activity-logs-heading">Admin Activity Logs</h2>
      </div>
      <p className="page-intro">Monitor recent student activity and event registrations.</p>

      <div className="admin-log-controls">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search student, event, or action"
          aria-label="Search activity logs"
        />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter activity logs by status">
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>

      {loading && <p className="admin-state">Loading activity logs…</p>}
      {error && <p className="admin-state error">{error}</p>}
      {!loading && !error && visibleLogs.length === 0 && <p className="admin-state">No activity logs match the selected filters.</p>}
      {!loading && !error && visibleLogs.length > 0 && (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Event</th><th>Action</th><th>Date/Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {visibleLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.student}</td><td>{log.event}</td><td>{log.action}</td><td>{formatDateTime(log.dateTime)}</td><td><span className="log-status">{log.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminActivityLogs;
