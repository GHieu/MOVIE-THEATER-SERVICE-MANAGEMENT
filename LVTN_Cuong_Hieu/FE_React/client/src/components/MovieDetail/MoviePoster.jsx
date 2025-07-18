// components/MoviePoster.jsx
import React from 'react';

const MoviePoster = ({ movie }) => {
  return (
    <div className="transform  -translate-y-16">
    <div className="flex justify-center md:justify-start md:items-center w-full md:w-auto pt-10 md:pt-0">
      <div className="w-6 md:w-72 shrink-0 shadow-xl rounded overflow-hidden border-4 border-white -mt-32 md:mt-0 z-10">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-auto object-cover "
        />
      </div>
    </div>
    </div>
  );
};

export default MoviePoster;