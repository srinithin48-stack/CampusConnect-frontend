import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { getTokenRole, setToken } from '../api/auth';
import collegeOptions from '../api/colleges';

const initialForm = { email: '', password: '', tenantId: '', remember: true };

const loginErrorMessage = (error) => {
  if (!error.response) return 'Unable to reach the CampusConnect server. Make sure the API is running and try again.';
  if (error.response.status === 401) return 'Invalid email or password for the selected college.';
  return error.response.data?.error?.message || 'Login failed. Please try again.';
};

function LoginPage() {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [navbarHeight, setNavbarHeight] = useState(72);

  useEffect(() => {
    if (location.state?.accountCreated) {
      setMessage('Account created! Please log in.');
      setMessageType('success');
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Size the page to the space left under the Navbar so it never scrolls.
  useLayoutEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return undefined;
    const update = () => setNavbarHeight(navbar.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(navbar);
    return () => observer.disconnect();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setMessage('');
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.password) {
      nextErrors.password = 'Password is required.';
    }
    if (!form.tenantId) {
      nextErrors.tenantId = 'Select your college.';
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setMessage('');
    try {
      const response = await api.post('/api/auth/login', {
        email: form.email.trim(),
        password: form.password,
        tenantId: form.tenantId
      });
      const { token } = response.data ?? {};
      if (!token) {
        setMessage('Login failed: the server did not return a token.');
        setSubmitting(false);
        return;
      }

      setToken(token, form.remember);
      const fallback = getTokenRole(token) === 'admin' ? '/admin/activity-logs' : '/';
      navigate(location.state?.from || fallback, { replace: true });
    } catch (error) {
      setMessage(loginErrorMessage(error));
      setMessageType('error');
      setSubmitting(false);
    }
  };

  return (
    <section className="login-page" style={{ minHeight: `calc(100vh - ${navbarHeight}px)` }}>
      <div className="login-card">
        <aside className="login-visual">
          <div className="login-visual-content">
            <svg className="login-cap" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M32 10 2 24l30 14 30-14L32 10Z" fill="currentColor" />
              <path d="M14 32v11c0 5 8.1 9 18 9s18-4 18-9V32l-18 8.4L14 32Z" fill="currentColor" />
              <path d="M56 27v14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <circle cx="56" cy="43" r="2.6" fill="currentColor" />
            </svg>
            <h1 className="login-brand">CampusConnect</h1>
            <p className="login-tagline">
              <span>Connect</span>
              <span className="login-dot" aria-hidden="true">•</span>
              <span>Participate</span>
              <span className="login-dot" aria-hidden="true">•</span>
              <span>Grow</span>
            </p>
            <p className="login-blurb">
              Your campus events, community and opportunities — all in one place.
            </p>
          </div>
          <div className="login-signature">
            <p>Better Campus<br />Together</p>
            <svg viewBox="0 0 120 16" aria-hidden="true">
              <path d="M2 13C40 6 78 3 118 2" />
            </svg>
          </div>
        </aside>

        <div className="login-form-panel">
          <p className="login-top-link">
            New here?
            <Link to="/create-account" className="login-link">
              Create an account
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </p>
          <h2 className="login-title">Welcome Back!</h2>
          <p className="login-subtitle">Log in to your CampusConnect account.</p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="login-label" htmlFor="login-email">Email Address</label>
            <div className={`login-input${errors.email ? ' has-error' : ''}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
              </svg>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <p className="login-error">{errors.email}</p>}

            <label className="login-label" htmlFor="login-password">Password</label>
            <div className={`login-input${errors.password ? ' has-error' : ''}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
                <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                <circle cx="12" cy="15.5" r="1.2" />
              </svg>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="login-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="M4 20 20 4" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="login-error">{errors.password}</p>}

            <label className="login-label" htmlFor="login-college">College</label>
            <div className={`login-input${errors.tenantId ? ' has-error' : ''}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 9.5 12 5l9 4.5" />
                <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3.5 20h17" />
              </svg>
              <select id="login-college" name="tenantId" value={form.tenantId} onChange={handleChange} required>
                <option value="">Select your college</option>
                {collegeOptions.map((college) => (
                  <option key={college.tenantId} value={college.tenantId}>{college.name}</option>
                ))}
              </select>
            </div>
            {errors.tenantId && <p className="login-error">{errors.tenantId}</p>}

            <div className="login-options">
              <label className="login-remember">
                <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} />
                <span>Remember me</span>
              </label>
              <a className="login-link" href="#" onClick={(event) => event.preventDefault()}>
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-submit" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Login'}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>

            {message && <p className={`login-message ${messageType}`} role="alert">{message}</p>}
          </form>

          <div className="login-divider"><span>OR</span></div>

          <p className="login-footer">
            Don&apos;t have an account?
            <Link to="/create-account" className="login-link">
              Create an account
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
