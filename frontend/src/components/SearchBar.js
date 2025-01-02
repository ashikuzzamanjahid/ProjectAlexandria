// SearchBar.js
import React from "react";

const SearchBar = ({ value, onChange }) => (
    <input
        type="text"
        placeholder="Search courses, topics, resources..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            marginBottom: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc",
        }}
    />
);

export default SearchBar;