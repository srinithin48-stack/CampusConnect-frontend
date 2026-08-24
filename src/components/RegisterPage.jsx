import React from 'react';
import RegistrationForm from './RegistrationForm';

function RegisterPage({ events }) {
  return (
    <section className="registration-wrapper registration-layout">
      <div className="section-heading highlight">
        <h2>Register</h2>
      </div>
      <div className="registration-grid">
        <div className="page-copy">
          <p className="page-intro">
            Join exciting campus events with a quick and easy registration. Fill in your details, choose your preferred event, and become part of technical, cultural, sports, and workshop activities across the campus.
          </p>
          <div className="info-panel">
            <div className="info-block">
              <h3>Why register?</h3>
              <ul>
                <li> Secure your seat before registrations close.</li>
                <li> Receive event updates and important reminders.</li>
                <li> Participate in competitions, workshops, and campus activities.</li>
                <li> Earn certificates and exciting prizes.</li>
              </ul>
            </div>
            <div className="info-block">
              <h3>Registration Guidelines</h3>
              <ul>
                <li>Use your official college email address for registration.</li>
                <li>Ensure all required information is entered accurately</li>
                <li>Review the selected event, date, and venue before submitting.</li>
                <li>Check your email for registration confirmation and event updates.</li>
              </ul>
            </div>
          </div>
        </div>
        <RegistrationForm events={events} />
      </div>
    </section>
  );
}

export default RegisterPage;
