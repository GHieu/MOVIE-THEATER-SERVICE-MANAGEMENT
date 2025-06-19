// components/MovieDetailHeader.jsx
import React from 'react';
import MoviePoster from './MoviePoster';
import MovieInfo from './MovieInfo';

const MovieDetailHeader = ({ movie }) => {
  return (
    <div className="pt-24 md:pt-1 space-y-4">
      <div className="flex flex-col md:flex-row gap-6 relative items-start">
        {/* Poster bên trái */}
        <MoviePoster movie={movie} />
        
        {/* Thông tin phim bên phải - chiều cao bằng poster */}
        <div className="flex-1 min-h-[320px] md:min-h-[400px]">
          <MovieInfo movie={movie} />
        </div>
      </div>
    </div>
  );
};

export default MovieDetailHeader;