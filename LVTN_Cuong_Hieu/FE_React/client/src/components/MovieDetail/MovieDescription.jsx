// components/MovieDescription.jsx
import React from 'react';

const MovieDescription = ({ movie }) => {
  return (
    <div className="mt-8">
      <h2 className="text-yellow-400 border-l-4 border-yellow-400 pl-2 mb-5">Nội Dung Phim</h2>
      <p className="text-gray-700 leading-relaxed">{movie.description}</p>
    </div>
  );
};

export default MovieDescription;