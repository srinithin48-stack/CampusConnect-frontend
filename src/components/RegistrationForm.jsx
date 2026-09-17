import React, { useEffect, useState } from 'react';
import api from '../api/client';

const collegeOptions = [
  { tenantId: 'psna', name: 'PSNA College of Engineering and Technology' },
  { tenantId: 'anna-university', name: 'Anna University' },
  { tenantId: 'psg', name: 'PSG College of Technology' },
  { tenantId: 'loyola', name: 'Loyola College' },
  { tenantId: 'mcc', name: 'Madras Christian College' },
  { tenantId: 'srm', name: 'SRM Institute of Science and Technology' },
  { tenantId: 'vit', name: 'VIT Vellore' },
  { tenantId: 'kct', name: 'Kumaraguru College of Technology' }
];

const initialFormData = { name: '', email: '', department: '', year: '', tenantId: '', event: '' };

const validateField = (name, value) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return 'This field is required.';
  if (name === 'email' && !/^\S+@\S+\.\S+$/.test(trimmedValue)) return 'Enter a valid email address.';
  if (name === 'name' && trimmedValue.length < 2) return 'Enter at least 2 characters.';
  return '';
};

function RegistrationForm({ events = [] }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (events.length && !events.some((event) => (event.title || event.name) === formData.event)) {
      setFormData((current) => ({ ...current, event: events[0].title || events[0].name || '' }));
    }
  }, [events, formData.event]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setMessage('');

    if (touched[name]) {
      setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = Object.fromEntries(Object.entries(formData).map(([name, value]) => [name, validateField(name, value)]));
    const hasErrors = Object.values(nextErrors).some(Boolean);
    setTouched(Object.keys(formData).reduce((result, name) => ({ ...result, [name]: true }), {}));
    setErrors(nextErrors);
    setMessage('');

    if (hasErrors) return;

    try {
      setSubmitting(true);
      const createdAt = new Date().toISOString();
      await api.post('/api/registrations', { ...formData, createdAt });
      await api.post('/api/telemetry', {
        studentName: formData.name.trim(),
        eventName: formData.event.trim(),
        action: 'registered',
        dateTime: createdAt,
        status: 'confirmed'
      });
      setMessage(`Thanks ${formData.name.trim()}! Your registration for ${formData.event} has been received.`);
      setFormData({ ...initialFormData, event: events[0]?.title || events[0]?.name || '' });
      setErrors({});
      setTouched({});
    } catch {
      setMessage('Unable to submit your registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName = (name) => {
    if (!touched[name]) return '';
    return errors[name] ? 'field-invalid' : 'field-valid';
  };

  return (
    <form className="registration-form" onSubmit={handleSubmit} noValidate>
      <div className="section-heading compact highlight">
        <h3>Event Registration</h3>
      </div>
      <label>
        <span>Name</span>
        <input className={inputClassName('name')} name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} aria-invalid={Boolean(errors.name)} />
        {touched.name && errors.name && <small className="form-error">{errors.name}</small>}
      </label>
      <label>
        <span>Email</span>
        <input className={inputClassName('email')} type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} aria-invalid={Boolean(errors.email)} />
        {touched.email && errors.email && <small className="form-error">{errors.email}</small>}
      </label>
      <div className="form-row">
        <label>
          <span>Department</span>
          <input className={inputClassName('department')} name="department" value={formData.department} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Computer Science" aria-invalid={Boolean(errors.department)} />
          {touched.department && errors.department && <small className="form-error">{errors.department}</small>}
        </label>
        <label>
          <span>Year of study</span>
          <select className={inputClassName('year')} name="year" value={formData.year} onChange={handleChange} onBlur={handleBlur} aria-invalid={Boolean(errors.year)}>
            <option value="">Select year</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
          </select>
          {touched.year && errors.year && <small className="form-error">{errors.year}</small>}
        </label>
      </div>
      <label>
        <span>College</span>
        <select className={inputClassName('tenantId')} name="tenantId" value={formData.tenantId} onChange={handleChange} onBlur={handleBlur} aria-invalid={Boolean(errors.tenantId)}>
          <option value="">Select college</option>
          {collegeOptions.map((college) => <option key={college.tenantId} value={college.tenantId}>{college.name}</option>)}
        </select>
        {touched.tenantId && errors.tenantId && <small className="form-error">{errors.tenantId}</small>}
      </label>
      <label>
        <span>Preferred event</span>
        <select className={inputClassName('event')} name="event" value={formData.event} onChange={handleChange} onBlur={handleBlur} aria-invalid={Boolean(errors.event)} disabled={!events.length}>
          {!events.length && <option value="">Loading events…</option>}
          {events.map((event) => <option key={event._id ?? event.id ?? event.title ?? event.name} value={event.title || event.name}>{event.title || event.name}</option>)}
        </select>
        {touched.event && errors.event && <small className="form-error">{errors.event}</small>}
      </label>
      <button className="detail-btn" type="submit" disabled={submitting || !events.length}>{submitting ? 'Registering…' : 'Register now'}</button>
      {message && <p className={`form-message ${message.startsWith('Thanks') ? 'success' : 'error'}`} role="status">{message}</p>}
    </form>
  );
}

export default RegistrationForm;
