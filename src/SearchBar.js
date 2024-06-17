// SearchBar.js

import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleChange}
        style={{
            width: '800px', // Set your desired width
            height: '40px', // Set your desired height
            fontSize: '18px', // Set your desired font size
            padding: '20px', // Adjust padding as needed
            borderRadius: '4px', // Add border radius for rounded corners
            border: '1px solid #ccc', // Add border for styling
          }}
      />
      <button type="submit" style={{ height: '85px',width:"200px",padding:"20px" }}>Search</button>

    </form>
  );
};

export default SearchBar;
