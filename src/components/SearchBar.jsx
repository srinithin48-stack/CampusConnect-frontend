import React from 'react';

function SearchBar({ value, onChange }) {
  return (
    <label className="search-field">
      <span className="search-icon">🔎</span>
      <input
        type="search"
        placeholder="Search by title or venue"
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

export default SearchBar;
