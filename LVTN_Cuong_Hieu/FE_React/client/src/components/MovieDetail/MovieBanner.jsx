// components/MovieBanner.jsx
import React from 'react';

const MovieBanner = ({ movie, onPlayTrailer }) => {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-black flex items-center justify-center">
      <img
        src={movie.banner || movie.poster}
        alt="banner"
        className="h-full object-contain"
      />
      <button
        onClick={onPlayTrailer}
        className="absolute inset-0 m-auto w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-black text-2xl hover:scale-110 transition"
        title="Xem trailer"
      >
        ▶
      </button>
    </div>
  );
};

export default MovieBanner;