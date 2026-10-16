import React from 'react';

const iconProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

const IconPin = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 1 0 5 9.5C5 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </svg>
);

const IconMail = (props) => (
  <svg {...iconProps} {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2.2" />
    <path d="M4 7.2 12 13l8-5.8" />
  </svg>
);

const IconPhone = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M5.2 4h3l1.4 4.4-2.3 2a12.4 12.4 0 0 0 5.9 5.9l2-2.3 4.4 1.4v3a1.4 1.4 0 0 1-1.5 1.4C9.9 19.4 4.6 14.1 4 5.9A1.4 1.4 0 0 1 5.2 4Z" />
  </svg>
);

const IconChat = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M4 5h16v10H9l-4 4V5Z" />
  </svg>
);

const IconClock = (props) => (
  <svg {...iconProps} {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

const IconHeadset = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M4.5 13.5v-1a7.5 7.5 0 1 1 15 0v1" />
    <rect x="3.2" y="13" width="4" height="6.2" rx="1.6" />
    <rect x="16.8" y="13" width="4" height="6.2" rx="1.6" />
    <path d="M19.5 19.2v.8a3 3 0 0 1-3 3h-1.7" />
  </svg>
);

const contactMethods = [
  { Icon: IconPin, title: 'Visit', detail: 'Event Coordination Office', action: '→' },
  { Icon: IconMail, title: 'Email', detail: 'events@campusconnect.edu.in', href: 'mailto:events@campusconnect.edu.in', action: '↗' },
  { Icon: IconPhone, title: 'Call', detail: '+91 6835320977', href: 'tel:+916835320977', ActionIcon: IconPhone }
];

const helpItems = [
  { Icon: IconChat, title: 'Quick Response', detail: 'We usually reply within 1-2 business days.' },
  { Icon: IconClock, title: 'Office Hours', detail: 'Mon - Fri, 9:00 AM - 5:00 PM' },
  { Icon: IconPin, title: 'Event Coordination Office', detail: 'Campus Administration Block' }
];

const faqItems = [
  { q: 'Who can I contact for event-related queries?', a: 'Reach out to the Event Coordination Office using the email or phone number listed above.' },
  { q: 'Can I participate in multiple events?', a: 'Yes, you can register for multiple events as long as their schedules do not overlap.' },
  { q: 'How do I register for an event?', a: 'Open the Events page, choose an event, and complete the registration form with your details.' },
  { q: 'Will I get a confirmation after registration?', a: 'Yes, you will see a confirmation as soon as your registration is submitted successfully.' },
  { q: 'Is there any registration fee?', a: 'Most campus events are free. Any paid events will clearly state the fee during registration.' }
];

function Contact() {
  return (
    <section id="contact" className="contact-section contact-reference">
      <div className="contact-hero">
        <div className="contact-hero-copy">
          <span className="contact-badge">Get in Touch</span>
          <h2>We&apos;re Here to Help</h2>
          <p>Have questions, need assistance, or want to know more about our events? We&apos;d love to hear from you!</p>
        </div>
      </div>

      <div className="contact-methods">
        {contactMethods.map(({ Icon, ActionIcon, ...item }) => (
          <a key={item.title} className="contact-method-card" href={item.href || undefined}>
            <span className="contact-method-icon" aria-hidden="true"><Icon width="20" height="20" /></span>
            <span className="contact-method-text">
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </span>
            <span className="contact-method-action" aria-hidden="true">
              {ActionIcon ? <ActionIcon width="16" height="16" /> : item.action}
            </span>
          </a>
        ))}
      </div>

      <div className="contact-info-grid">
        <div className="contact-help-card">
          <span className="contact-help-icon" aria-hidden="true"><IconHeadset width="22" height="22" /></span>
          <h3>Need Help?</h3>
          <p>Have questions about event registration, schedules, or participation? Contact the Event Coordination Office.</p>
          <ul className="contact-help-list">
            {helpItems.map(({ Icon, ...item }) => (
              <li key={item.title}>
                <span aria-hidden="true"><Icon width="17" height="17" /></span>
                <span><strong>{item.title}</strong><small>{item.detail}</small></span>
              </li>
            ))}
          </ul>
        </div>

        <div className="contact-faq-card">
          <div className="contact-faq-header">
            <span className="contact-faq-icon" aria-hidden="true">?</span>
            <div>
              <h3>Frequently Asked Questions</h3>
              <p>Find quick answers to common queries about events and registration.</p>
            </div>
          </div>
          <div className="faq-accordion">
            {faqItems.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
