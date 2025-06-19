// components/MovieDescription.jsx
import React from 'react';

const MovieDescription = ({ movie }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-2">Nội Dung Phim</h2>
      <p className="text-gray-700 leading-relaxed">{movie.description}</p>
    </div>
  );
};

export default MovieDescription;