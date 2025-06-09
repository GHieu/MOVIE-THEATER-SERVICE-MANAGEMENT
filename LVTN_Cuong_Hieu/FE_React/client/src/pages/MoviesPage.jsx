import React from 'react';
import MovieCard from '../components/MovieCard';
import useMoviesUser from '../hooks/useMovieUser';

export default function MoviesPage() {
  const { movies, loading, error } = useMoviesUser();

  if (loading) return <div className="text-center py-10">Đang tải dữ liệu phim...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* PHIM ĐANG CHIẾU */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-yellow-400">Phim Đang Chiếu</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* PHIM SẮP CHIẾU */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-yellow-400">Phim Sắp Chiếu</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))} */}
          Chưa có
        </div>
      </section>
    </div>
  );
}
