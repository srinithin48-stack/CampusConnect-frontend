import React from 'react';

function EventFilterToolbar({ searchTerm, onSearchChange, activeCategory, onCategoryChange, categories }) {
  return (
    <section className="toolbar" aria-label="Event filters">
      <input
        id="search-input"
        type="search"
        placeholder="Search events by title or venue"
        value={searchTerm}
        onChange={onSearchChange}
      />
      <div className="filters">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
            type="button"
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}

export default EventFilterToolbar;
