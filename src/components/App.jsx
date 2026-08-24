import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import Router from './Router';

function App() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedEventId, setExpandedEventId] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Unable to load events from JSON Server.', error);
      }
    };

    loadEvents();
  }, []);

  const visibleEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return events.filter((event) => {
      const matchesCategory = activeCategory === 'All' || event.category === activeCategory;
      const searchableText = `${event.title} ${event.venue} ${event.category}`.toLowerCase();
      const matchesSearch = searchableText.includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [events, searchTerm, activeCategory]);

  const categories = ['All', ...new Set(events.map((event) => event.category))];

  const toggleExpanded = (eventId) => {
    setExpandedEventId((current) => (current === eventId ? null : eventId));
  };

  return (
    <>
      <Router
        events={visibleEvents}
        allEvents={events}
        searchTerm={searchTerm}
        onSearchChange={(event) => setSearchTerm(event.target.value)}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        expandedEventId={expandedEventId}
        onToggleExpanded={toggleExpanded}
      />
    </>
  );
}

export default App;
