import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home';
import EventsPage from './EventsPage';
import AboutPage from './AboutPage';
import RegisterPage from './RegisterPage';
import ContactPage from './ContactPage';
import Footer from './Footer';
import AdminActivityLogs from './AdminActivityLogs';
import AdminEventManagement from './AdminEventManagement';

function Router({ events, allEvents, searchTerm, onSearchChange, categories, activeCategory, onCategoryChange, expandedEventId, onToggleExpanded, onEventsChange }) {
  return (
    <BrowserRouter>
      <Navbar />
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
        <Route path="/register" element={<RegisterPage events={allEvents} />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
        <Route path="/admin/event-management" element={<AdminEventManagement events={allEvents} onEventsChange={onEventsChange} />} />
        <Route path="/admin/events" element={<AdminEventManagement events={allEvents} onEventsChange={onEventsChange} />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default Router;
