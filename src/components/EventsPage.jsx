import React from 'react';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import EventList from './EventList';

function EventsPage({ events, searchTerm, onSearchChange, categories, activeCategory, onCategoryChange, expandedEventId, onToggleExpanded }) {
  return (
    <section className="content">
      <div className="section-heading highlight">
        <h2>Events</h2>
      </div>
      <p className="page-intro">
        Explore the latest campus events, workshops, cultural showcases and competitions. Filter by category or search by name to find the right experience.
      </p>
      <section className="toolbar" aria-label="Event filters">
        <SearchBar value={searchTerm} onChange={onSearchChange} />
        <CategoryFilter categories={categories} activeCategory={activeCategory} onSelect={onCategoryChange} />
      </section>
      <div className="results-row">
        <p className="results-count">Showing {events.length} event{events.length === 1 ? '' : 's'}</p>
      </div>
      <EventList events={events} expandedEventId={expandedEventId} onToggleExpanded={onToggleExpanded} />
    </section>
  );
}

export default EventsPage;
