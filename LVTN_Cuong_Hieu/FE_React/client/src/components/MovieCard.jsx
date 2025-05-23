import React from 'react';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  // Dữ liệu mẫu nếu chưa truyền
  const mockMovie = {
    id: '1',
    poster: '/assets/sample-movie.jpg',
    title: 'Tên phim mẫu',
    genre: 'Thể loại mẫu',
  };

  const currentMovie = movie || mockMovie;

  return (
    <Link to={`/movies/${currentMovie.id}`} className="block">
      <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-300">
        <img
          src={currentMovie.poster}
          alt={currentMovie.title}
          className="w-full h-60 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-black">{currentMovie.title}</h3>
          <p className="text-sm text-gray-500 mt-1">Thể loại: {currentMovie.genre}</p>
          <Link to={`/booking/${currentMovie.id}`}>
            <button className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded">
            Đặt vé
            </button>
          </Link>

          
        </div>
      </div>
    </Link>
  );
}
