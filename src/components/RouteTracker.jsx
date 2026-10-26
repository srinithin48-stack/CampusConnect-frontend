import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordRouteEvent, ROUTE_EVENTS } from '../api/routeAnalytics';

// Records a route visit once the location settles. Guards and the not-found route redirect
// in an effect, which changes window.location first, so their source path is never counted.
function RouteTracker() {
  const location = useLocation();
  const { user } = useAuth();
  const recordedKey = useRef(null);
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    const timer = setTimeout(() => {
      const settled = window.location.pathname === location.pathname;
      if (!settled || recordedKey.current === location.key) return;
      recordedKey.current = location.key;
      recordRouteEvent(ROUTE_EVENTS.visit, { path: location.pathname, status: 'success', user: userRef.current });
    }, 0);
    return () => clearTimeout(timer);
  }, [location.key, location.pathname]);

  return null;
}

export default RouteTracker;
