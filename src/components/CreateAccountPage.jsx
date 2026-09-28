import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import collegeOptions from '../api/colleges';

const initialForm = { fullName: '', email: '', password: '', confirmPassword: '', tenantId: '' };

const signupErrorMessage = (error) => {
  if (!error.response) return 'Unable to reach the CampusConnect server. Make sure the API is running and try again.';
  return error.response.data?.error?.message || 'Account creation failed. Please try again.';
};

const validate = (form) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!form.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.password) {
    errors.password = 'Password is required.';
  } else if (form.password.length < 8) {
    errors.password = 'Use at least 8 characters.';
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  if (!form.tenantId) errors.tenantId = 'Select your college.';
  return errors;
};

function Field({ id, label, error, children }) {
  return (
    <div className="signup-field">
      <label htmlFor={id}>{label} <span className="signup-required" aria-hidden="true">*</span></label>
      {children}
      {error && <p className="signup-error">{error}</p>}
    </div>
  );
}

function CreateAccountPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/api/auth/register', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        tenantId: form.tenantId
      });
      navigate('/login', { state: { accountCreated: true } });
    } catch (error) {
      setMessage(signupErrorMessage(error));
      setSubmitting(false);
    }
  };

  const inputProps = (name) => ({
    id: `signup-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    className: errors[name] ? 'has-error' : '',
    'aria-invalid': Boolean(errors[name])
  });

  return (
    <section className="signup-page">
      <div className="signup-layout">
        <div className="signup-card">
          <h1 className="signup-title">Create Your Account</h1>
          <p className="signup-subtitle">Join CampusConnect and be part of a vibrant campus community.</p>

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <Field id="signup-fullName" label="Full Name" error={errors.fullName}>
              <input {...inputProps('fullName')} type="text" autoComplete="name" placeholder="Enter your full name" />
            </Field>

            <Field id="signup-email" label="Email Address" error={errors.email}>
              <input {...inputProps('email')} type="email" autoComplete="email" placeholder="Enter your email address" />
            </Field>

            <div className="signup-row">
              <Field id="signup-password" label="Password" error={errors.password}>
                <input {...inputProps('password')} type="password" autoComplete="new-password" placeholder="Enter your password" />
              </Field>
              <Field id="signup-confirmPassword" label="Confirm Password" error={errors.confirmPassword}>
                <input {...inputProps('confirmPassword')} type="password" autoComplete="new-password" placeholder="Confirm your password" />
              </Field>
            </div>

            <Field id="signup-tenantId" label="College" error={errors.tenantId}>
              <select {...inputProps('tenantId')} required>
                <option value="">Select your college</option>
                {collegeOptions.map((college) => (
                  <option key={college.tenantId} value={college.tenantId}>{college.name}</option>
                ))}
              </select>
            </Field>

            <button type="submit" className="signup-submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
            {message && <p className="signup-message error" role="alert">{message}</p>}
          </form>

          <div className="signup-divider"><span>OR</span></div>

          <p className="signup-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        <aside className="signup-aside">
          <svg className="signup-icon" viewBox="0 0 96 72" aria-hidden="true">
            <path d="M48 2v9M30 8l5 7M66 8l-5 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="48" cy="28" r="9" fill="currentColor" />
            <path d="M30 62c0-11 8-19 18-19s18 8 18 19Z" fill="currentColor" />
            <circle cx="24" cy="35" r="7" fill="currentColor" opacity="0.8" />
            <path d="M10 64c0-9 6-15 14-15 4 0 7 1 9 3-3 3-5 8-5 12Z" fill="currentColor" opacity="0.8" />
            <circle cx="72" cy="35" r="7" fill="currentColor" opacity="0.55" />
            <path d="M86 64c0-9-6-15-14-15-4 0-7 1-9 3 3 3 5 8 5 12Z" fill="currentColor" opacity="0.55" />
          </svg>
          <h2>Connect. Learn. Grow.</h2>
          <p>Join CampusConnect to discover events, workshops and opportunities on campus.</p>
        </aside>
      </div>
    </section>
  );
}

export default CreateAccountPage;
