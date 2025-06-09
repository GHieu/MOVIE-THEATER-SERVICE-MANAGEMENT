import React from 'react';
import { useNavigate } from 'react-router-dom'; // <-- thêm dòng này

import Banner from '../components/Banner';
import MovieCard from '../components/MovieCard';
import NewsSection from '../components/NewsSection';
import useMoviesUser from '../hooks/useMovieUser';

export default function HomePage() {
  const navigate = useNavigate(); // <-- khai báo navigate
  const { movies, loading, error } = useMoviesUser();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Banner />
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Phim đang chiếu</h2>

          {loading && <p>Đang tải phim...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Nút Xem thêm */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate('/movies')}
              className="border border-yellow-400 text-yellow-500 bg-white hover:bg-yellow-400 hover:text-white font-semibold px-6 py-2 rounded shadow-md transition duration-300"

            >
              Xem thêm
            </button>
          </div>
        </section>

        <NewsSection />
      </main>
    </div>
  );
}
