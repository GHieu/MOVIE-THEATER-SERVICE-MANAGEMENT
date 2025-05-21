import React from 'react';
import MovieCard from '../components/MovieCard';

export default function MoviesPage() {
  // Dữ liệu mẫu chia thành 2 nhóm
  const nowShowing = [
    { id: 1, title: 'Lật Mặt 7', poster: '/assets/movie1.jpg' },
    { id: 2, title: 'Đào Phở và Piano', poster: '/assets/movie2.jpg' },
  ];

  const comingSoon = [
    { id: 3, title: 'Tarot', poster: '/assets/movie3.jpg' },
    { id: 4, title: 'Quỷ Cẩu', poster: '/assets/movie4.jpg' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* PHIM ĐANG CHIẾU */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-yellow-400">Phim Đang Chiếu</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {nowShowing.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* PHIM SẮP CHIẾU */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-yellow-400">Phim Sắp Chiếu</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {comingSoon.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
