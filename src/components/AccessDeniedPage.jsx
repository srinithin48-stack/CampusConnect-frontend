import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function AccessDeniedPage() {
  const { state } = useLocation();

  return (
    <section className="route-status" aria-labelledby="access-denied-heading">
      <h2 id="access-denied-heading">Access denied</h2>
      <p className="page-intro">
        {state?.from ? <>You do not have permission to view <code>{state.from}</code>.</> : 'You do not have permission to view that page.'}
        {' '}Admin pages are only available to administrator accounts.
      </p>
      <Link className="detail-btn" to="/">Back to Home</Link>
    </section>
  );
}

export default AccessDeniedPage;
