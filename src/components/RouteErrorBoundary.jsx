import React from 'react';
import { recordRouteEvent, ROUTE_EVENTS } from '../api/routeAnalytics';

// Catches a lazily loaded page that fails to download or render, records it as a
// navigation failure, and offers a reload. Router remounts it on every path change.
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    recordRouteEvent(ROUTE_EVENTS.failure, {
      path: this.props.path,
      status: error?.isChunkLoadError ? 'load_error' : 'render_error',
      user: this.props.user
    });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="route-status" role="alert">
        <h2>This page could not be loaded.</h2>
        <p className="page-intro">Check your connection and try again.</p>
        <button className="detail-btn" type="button" onClick={() => window.location.reload()}>Reload page</button>
      </section>
    );
  }
}

export default RouteErrorBoundary;
