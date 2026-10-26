import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordRouteEvent, ROUTE_EVENTS } from '../api/routeAnalytics';

// Logged-out users go to Login; logged-in users without an allowed role go to Access Denied.
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const forbidden = isAuthenticated && roles && !roles.includes(user.role);
  const deniedStatus = !isAuthenticated ? 'login_required' : forbidden ? 'forbidden' : null;
  const recordedKey = useRef(null);

  useEffect(() => {
    // The ref keeps StrictMode's double effect run from recording one visit twice.
    if (!deniedStatus || recordedKey.current === location.key) return;
    recordedKey.current = location.key;
    recordRouteEvent(ROUTE_EVENTS.denied, { path: location.pathname, status: deniedStatus, user });
  }, [deniedStatus, location.key, location.pathname, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (forbidden) {
    return <Navigate to="/access-denied" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
