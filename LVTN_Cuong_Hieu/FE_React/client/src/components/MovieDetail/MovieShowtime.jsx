// components/MovieShowtime.jsx
import React from 'react';
import ShowTimeTabs from './ShowTimeTabs';

const MovieShowtime = ({ movieId }) => {
  return (
    <div className="mt-6">
      <h2 className="  py-1  font-semibold ">
            <span className="text-yellow-400 border-l-4 border-yellow-400 pl-2">Lịch Chiếu</span>
      </h2>
      <ShowTimeTabs movieId={movieId.id} />
    </div>
  );
};

export default MovieShowtime;