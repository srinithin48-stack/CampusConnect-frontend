import React, { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home';
import LoginPage from './LoginPage';
import Footer from './Footer';
import ProtectedRoute from './ProtectedRoute';
import RouteTracker from './RouteTracker';
import RouteErrorBoundary from './RouteErrorBoundary';
import { useAuth } from '../context/AuthContext';
import { recordRouteEvent, ROUTE_EVENTS } from '../api/routeAnalytics';

// Marks a failed chunk download so RouteErrorBoundary can tell it apart from a render error.
const lazyPage = (load) => lazy(() => load().catch((error) => {
  throw Object.assign(error instanceof Error ? error : new Error(String(error)), { isChunkLoadError: true });
}));

// Home (the landing page) and Login (where every guarded route redirects) stay in the main
// bundle; every other page is a separate chunk.
const publicPages = {
  events: () => import('./EventsPage'),
  about: () => import('./AboutPage'),
  register: () => import('./RegisterPage'),
  contact: () => import('./ContactPage'),
  createAccount: () => import('./CreateAccountPage')
};

const EventsPage = lazyPage(publicPages.events);
const AboutPage = lazyPage(publicPages.about);
const RegisterPage = lazyPage(publicPages.register);
const ContactPage = lazyPage(publicPages.contact);
const CreateAccountPage = lazyPage(publicPages.createAccount);
const AccessDeniedPage = lazyPage(() => import('./AccessDeniedPage'));
const AdminActivityLogs = lazyPage(() => import('./AdminActivityLogs'));
const AdminEventManagement = lazyPage(() => import('./AdminEventManagement'));
const AdminRoutingAnalytics = lazyPage(() => import('./AdminRoutingAnalytics'));

const ADMIN_ROLES = ['admin'];
const PREFETCH_DELAY_MS = 2000;

// Keeps the first load small, then downloads the public pages while the browser is idle so the
// first click to them does not wait on the network. Admin pages still load only when opened.
const usePrefetchPublicPages = () => {
  useEffect(() => {
    let cancelIdle = () => {};
    const prefetch = () => Object.values(publicPages).forEach((load) => load().catch(() => {}));
    const scheduleWhenIdle = () => {
      if (window.requestIdleCallback) {
        const id = window.requestIdleCallback(prefetch, { timeout: PREFETCH_DELAY_MS });
        cancelIdle = () => window.cancelIdleCallback(id);
      } else {
        const timer = setTimeout(prefetch, PREFETCH_DELAY_MS);
        cancelIdle = () => clearTimeout(timer);
      }
    };

    // Wait for the initial page load so prefetching never competes with it.
    if (document.readyState === 'complete') scheduleWhenIdle();
    else window.addEventListener('load', scheduleWhenIdle, { once: true });
    return () => {
      window.removeEventListener('load', scheduleWhenIdle);
      cancelIdle();
    };
  }, []);
};

function PageFooter() {
  const { pathname } = useLocation();
  return pathname === '/login' ? null : <Footer />;
}

// Unknown paths are recorded as navigation failures, then sent Home as before.
function NotFoundRedirect() {
  const { key, pathname } = useLocation();
  const { user } = useAuth();
  const recordedKey = useRef(null);

  useEffect(() => {
    if (recordedKey.current === key) return;
    recordedKey.current = key;
    recordRouteEvent(ROUTE_EVENTS.failure, { path: pathname, status: 'not_found', user });
  }, [key, pathname, user]);

  return <Navigate replace to="/" />;
}

function AppRoutes({ events, allEvents, eventsStatus, searchTerm, onSearchChange, categories, activeCategory, onCategoryChange, expandedEventId, onToggleExpanded, onEventsChange }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const admin = (page) => <ProtectedRoute roles={ADMIN_ROLES}>{page}</ProtectedRoute>;

  return (
    <RouteErrorBoundary key={pathname} path={pathname} user={user}>
      <Suspense fallback={<p className="route-loading" role="status">Loading page…</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/events"
            element={
              <EventsPage
                events={events}
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={onCategoryChange}
                expandedEventId={expandedEventId}
                onToggleExpanded={onToggleExpanded}
              />
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/register" element={<RegisterPage events={allEvents} eventsStatus={eventsStatus} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="/admin/activity-logs" element={admin(<AdminActivityLogs />)} />
          <Route path="/admin/routing-analytics" element={admin(<AdminRoutingAnalytics />)} />
          <Route path="/admin/event-management" element={admin(<AdminEventManagement events={allEvents} onEventsChange={onEventsChange} />)} />
          <Route path="/admin/events" element={admin(<AdminEventManagement events={allEvents} onEventsChange={onEventsChange} />)} />
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}

function Router(props) {
  usePrefetchPublicPages();

  return (
    <BrowserRouter>
      <RouteTracker />
      <Navbar />
      <AppRoutes {...props} />
      <PageFooter />
    </BrowserRouter>
  );
}

export default Router;
