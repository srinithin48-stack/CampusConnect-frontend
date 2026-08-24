import React from 'react';

const contactItems = [
  { icon: '📍', title: 'Visit', detail: 'Event Coordination Office' },
  { icon: '📧', title: 'Email', detail: 'events@campusconnect.edu.in' },
  { icon: '📞', title: 'Call', detail: '+91 6835320977' }
];

function Contact() {
  return (
    <section id="contact" className="contact-section contact-layout">
      <div className="section-heading highlight">
        <h2>Get in touch</h2>
      </div>
      <div className="contact-grid-layout">
        <div className="page-copy">
          <p className="page-intro">
            Our team is here to help you find events, answer questions, and ensure your campus experience is easy and fun.
          </p>
          <div className="contact-grid">
            {contactItems.map((item) => (
              <article key={item.title} className="contact-card">
                <div className="contact-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="contact-panel">
          <div className="info-block">
            <h3>Need Help?</h3>
            <p>
              Have questions about event registration, schedules, or participation? Contact the Event Coordination Office for guidance and support.
            </p>
          </div>
          <div className="info-block">
            <h3>Frequently Asked Questions</h3>
            <ul className="faq-list">
              <li><strong>Who can I contact for event-related queries?</strong> Use the email or phone number provided above to reach the Student Activities Team.</li>
              <li><strong>Can I participate in multiple events?</strong> Yes, you can register for multiple events if their schedules do not overlap.</li>
              <li><strong>What should I do if I face registration issues?</strong> Contact the Event Coordination Office or email the support team for assistance.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Contact;
