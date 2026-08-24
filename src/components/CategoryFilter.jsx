import React from 'react';

function CategoryFilter({ categories, activeCategory, onSelect }) {
  return (
    <div className="filters">
      {categories.map((category) => (
        <button
          key={category}
          className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
          type="button"
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
