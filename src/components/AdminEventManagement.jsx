import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import AdminSidebar from './AdminSidebar';

const emptyForm = {
  title: '', category: '', date: '', venue: '', description: '', details: '', schedule: '', metadata: ''
};

const eventId = (event) => event._id || event.id;
const eventTitle = (event) => event.title || event.name || 'Untitled event';
const eventFromResponse = (data) => data?.event || data;

const parseObject = (value, field) => {
  const parsed = JSON.parse(value || '{}');
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error(`${field} must be a JSON object.`);
  return parsed;
};

const normalizeJsonObject = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
      return null;
    }
  }
  return null;
};

const formFromEvent = (event) => {
  const schedule = normalizeJsonObject(event.schedule);
  const metadata = normalizeJsonObject(event.metadata);
  return {
    title: event.title || event.name || '',
    category: event.category || '',
    date: event.date || '',
    venue: event.venue || event.location || '',
    description: event.description || event.summary || '',
    details: Array.isArray(event.details) ? event.details.join('\n') : '',
    schedule: schedule && Object.keys(schedule).length ? JSON.stringify(schedule, null, 2) : '',
    metadata: metadata && Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : ''
  };
};

function AdminEventManagement({ events: sourceEvents = [], onEventsChange }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const verifySystemLog = async (action, id) => {
    try {
      const response = await api.get('/api/system-logs');
      const logs = Array.isArray(response.data) ? response.data : [];
      return logs.some((log) => String(log.eventId || log.event?._id || log.event?.id) === String(id)
        && String(log.action || '').toLowerCase().includes(action));
    } catch {
      return false;
    }
  };

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setMessage('');
    setIsModalOpen(true);
  };

  const refreshEvents = useCallback(async () => {
    const response = await api.get('/api/events');
    onEventsChange(Array.isArray(response.data) ? response.data : []);
  }, [onEventsChange]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        await refreshEvents();
      } catch {
        setError('Unable to load events from the API. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [refreshEvents]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!form.title.trim() || !form.category.trim()) {
      setError('Title and category are required.');
      return;
    }

    let payload;
    try {
      payload = {
        title: form.title.trim(),
        category: form.category.trim(),
        date: form.date.trim(),
        venue: form.venue.trim(),
        description: form.description.trim(),
        details: form.details.split('\n').map((item) => item.trim()).filter(Boolean),
        schedule: parseObject(form.schedule, 'Schedule'),
        metadata: parseObject(form.metadata, 'Metadata')
      };
    } catch (parseError) {
      setError(parseError.message);
      return;
    }

    try {
      setSaving(true);
      const action = editingId ? 'updated' : 'created';
      const response = editingId
        ? await api.put(`/api/events/${editingId}`, payload)
        : await api.post('/api/events', payload);
      const savedEvent = eventFromResponse(response.data);
      const savedId = eventId(savedEvent) || editingId;
      await refreshEvents();
      const logged = savedId && await verifySystemLog(action, savedId);
      setMessage(`Event ${action}.${logged ? ' SystemLog activity verified.' : ' SystemLog verification is unavailable.'}`);
      reset();
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Unable to ${editingId ? 'update' : 'create'} the event.`);
    } finally {
      setSaving(false);
    }
  };

  const edit = (event) => {
    setForm(formFromEvent(event));
    setEditingId(eventId(event));
    setError('');
    setMessage('');
    setIsModalOpen(true);
  };

  const categories = ['All', ...new Set(sourceEvents.map((event) => event.category).filter(Boolean))];
  const eventStatus = (event) => event.status || event.metadata?.status || 'Upcoming';
  const statuses = ['All', ...new Set(sourceEvents.map(eventStatus))];
  const visibleEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return sourceEvents.filter((event) => {
      const matchesSearch = `${eventTitle(event)} ${event.venue || event.location || ''} ${event.category || ''}`.toLowerCase().includes(term);
      return matchesSearch
        && (categoryFilter === 'All' || event.category === categoryFilter)
        && (statusFilter === 'All' || eventStatus(event) === statusFilter);
    });
  }, [sourceEvents, searchTerm, categoryFilter, statusFilter]);
  const events = visibleEvents;

  const remove = async (event) => {
    const id = eventId(event);
    if (!id || !window.confirm(`Delete “${eventTitle(event)}”? This cannot be undone.`)) return;
    setError('');
    setMessage('');
    try {
      setSaving(true);
      await api.delete(`/api/events/${id}`);
      await refreshEvents();
      const logged = await verifySystemLog('deleted', id);
      setMessage(`Event deleted.${logged ? ' SystemLog activity verified.' : ' SystemLog verification is unavailable.'}`);
      if (editingId === id) reset();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete the event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-event-shell">
      <header className="admin-topbar">
        <div className="admin-brand"><span>CC</span> CampusConnect</div>
        <div className="admin-profile"><span aria-hidden="true">♧</span><strong>A</strong><span>Admin⌄</span></div>
      </header>
    <div className="admin-layout admin-reference-layout">
      <AdminSidebar />
      <section className="admin-events" aria-labelledby="event-management-heading">
        <header className="admin-events-header">
          <span className="admin-heading-icon" aria-hidden="true">▣</span>
          <div>
            <p className="admin-eyebrow">Event administration</p>
            <h2 id="event-management-heading">Event Management</h2>
            <p>Create, edit and manage campus events. Keep your community engaged!</p>
          </div>
          <button className="admin-primary-button" type="button" onClick={openCreateForm}>+ Create New Event</button>
        </header>

        {(error || message) && !isModalOpen && <p className={`admin-notice ${error ? 'error' : 'success'}`} role={error ? 'alert' : 'status'}>{error || message}</p>}

        <div className="admin-event-controls" aria-label="Event list controls">
          <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search events, categories, or venues" aria-label="Search events" />
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter events by category">
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter events by status">
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <span>{visibleEvents.length} event{visibleEvents.length === 1 ? '' : 's'}</span>
        </div>

        {isModalOpen && <div className="admin-modal-backdrop" role="presentation" onMouseDown={reset}>
          <div className="admin-event-modal" role="dialog" aria-modal="true" aria-labelledby="event-form-heading" onMouseDown={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div><p className="admin-eyebrow">{editingId ? 'Update event' : 'New event'}</p><h3 id="event-form-heading">{editingId ? 'Edit event details' : 'Create a new event'}</h3></div>
              <button className="admin-icon-button" type="button" onClick={reset} aria-label="Close event form">×</button>
            </div>
        <form className="admin-event-form" onSubmit={submit} noValidate>
          <div className="admin-form-grid">
            <label><span>Title *</span><input name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
            <label><span>Category *</span><input name="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></label>
          </div>
          <div className="admin-form-grid">
            <label><span>Date</span><input name="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="e.g. Sep 20, 2026" /></label>
            <label><span>Venue</span><input name="venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></label>
          </div>
          <label><span>Description</span><textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label><span>Details (one per line)</span><textarea name="details" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} /></label>
          <details className="admin-advanced-fields">
            <summary>Advanced fields <span>Optional schedule and metadata</span></summary>
          <div className="admin-form-grid">
            <label><span>Schedule</span><textarea value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="{}" spellCheck="false" /></label>
            <label><span>Metadata</span><textarea value={form.metadata} onChange={(e) => setForm({ ...form, metadata: e.target.value })} placeholder="{}" spellCheck="false" /></label>
          </div>
          </details>
          <div className="admin-form-actions">
            <button className="detail-btn" disabled={saving} type="submit">{saving ? 'Saving…' : editingId ? 'Update event' : 'Create event'}</button>
            <button className="admin-secondary-button" type="button" onClick={reset}>Cancel</button>
          </div>
          {error && <p className="form-message error" role="alert">{error}</p>}
          {message && <p className="form-message success" role="status">{message}</p>}
        </form>
          </div>
        </div>}
        <div className="admin-table-wrap">
          <table><thead><tr><th>Event</th><th>Category</th><th>Date</th><th>Venue</th><th>Actions</th></tr></thead>
            <tbody>{events.map((event) => <tr key={eventId(event) || eventTitle(event)}><td>{eventTitle(event)}</td><td>{event.category || 'General'}</td><td>{event.date || event.schedule?.date || '—'}</td><td>{event.venue || event.location || event.schedule?.venue || '—'}</td><td className="admin-actions"><button type="button" onClick={() => edit(event)}>Edit</button><button type="button" onClick={() => remove(event)} disabled={saving}>Delete</button></td></tr>)}</tbody>
          </table>
        </div>
        <section className="admin-reference-table" aria-labelledby="all-events-heading">
          <h3 id="all-events-heading">All Events <span>({visibleEvents.length})</span></h3>
          <div className="admin-reference-table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>Date &amp; Time</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {events.map((event) => (
                  <tr key={eventId(event) || eventTitle(event)}>
                    <td className="admin-event-title"><span className="admin-event-mark">{(event.category || 'E').slice(0, 1)}</span><span><strong>{eventTitle(event)}</strong><small>{event.description || event.summary || 'Campus event'}</small></span></td>
                    <td><span className="admin-category-tag">{event.category || 'General'}</span></td>
                    <td>{event.schedule?.start || event.date || '—'}</td>
                    <td>{event.venue || event.location || event.schedule?.venue || '—'}</td>
                    <td><span className="admin-status-tag">{eventStatus(event)}</span></td>
                    <td className="admin-actions"><button type="button" onClick={() => edit(event)} aria-label={`Edit ${eventTitle(event)}`}>✎</button><button type="button" onClick={() => remove(event)} disabled={saving} aria-label={`Delete ${eventTitle(event)}`}>⌫</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
    </div>
  );
}

export default AdminEventManagement;
