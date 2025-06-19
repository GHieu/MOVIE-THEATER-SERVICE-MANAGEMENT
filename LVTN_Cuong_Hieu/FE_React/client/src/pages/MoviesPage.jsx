import React from 'react';
import { useLocation } from 'react-router-dom';
import useMoviesUser from '../hooks/useMovieUser';
import MovieTabs from '../components/MovieMoviePage/MovieTabs';

export default function MoviesPage() {
  const { nowShowing, comingSoon, loading, error } = useMoviesUser();
  const location = useLocation();
  const defaultTab = location.state?.tab || 'now';

  if (loading) return <div className="text-center py-10">Đang tải dữ liệu phim...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-yellow-400 mb-4 text-center">Danh sách phim</h2>
      <MovieTabs nowShowing={nowShowing} comingSoon={comingSoon} defaultTab={defaultTab} />
    </div>
  );
}
