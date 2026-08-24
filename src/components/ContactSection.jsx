import React, { useState } from 'react';

function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  return (
    <section id="contact" className="contact-section">
      <h2>Contact</h2>
      <p>For event updates, club coordination, and campus announcements, reach out to the student activities team.</p>
      <div className="contact-grid">
        <article className="contact-card">
          <h3>📍 Visit</h3>
          <p>Event Coordination Office</p>
          <p>Student Section, Room 204</p>
        </article>
        <article className="contact-card">
          <h3>📧 Email</h3>
          <p>events@campusconnect.edu.in</p>
        </article>
        <article className="contact-card">
          <h3>📞 Phone</h3>
          <p>+91 6835320977</p>
        </article>
      </div>

      <form className="contact-card contact-card--compact" onSubmit={(event) => event.preventDefault()}>
        <h3>Stay updated</h3>
        <label>
          <span>Name</span>
          <input name="name" value={formData.name} onChange={handleChange} />
        </label>
        <label>
          <span>Email</span>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </label>
        <button className="detail-btn" type="submit">Subscribe</button>
      </form>
    </section>
  );
}

export default ContactSection;
