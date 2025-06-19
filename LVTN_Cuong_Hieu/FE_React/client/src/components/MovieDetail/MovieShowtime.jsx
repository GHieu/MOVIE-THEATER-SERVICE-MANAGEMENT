// components/MovieShowtime.jsx
import React from 'react';
import ShowTimeTabs from './ShowTimeTabs';

const MovieShowtime = ({ movieId }) => {
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold mb-4">Lịch Chiếu</h2>
      <ShowTimeTabs movieId={movieId.id} />
    </div>
  );
};

export default MovieShowtime;