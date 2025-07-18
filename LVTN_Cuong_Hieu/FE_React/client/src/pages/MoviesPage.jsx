import React ,{useEffect}from 'react';
import { useLocation } from 'react-router-dom';
import useMoviesUser from '../hooks/useMovieUser';
import MovieTabs from '../components/MovieMoviePage/MovieTabs';
import useRatingMovies from '../hooks/useRatingMovies';
export default function MoviesPage() {
  const { nowShowing, comingSoon, loading, error } = useMoviesUser();
  const location = useLocation();
  const defaultTab = location.state?.tab || 'now';
  const { reviews, fetchReviews } = useRatingMovies();
  useEffect(() => {
      fetchReviews(); // ← Gọi API reviews 1 lần khi vào HomePage
    }, []);
  if (loading) return <div className="flex justify-center items-center min-h-screen">Đang tải dữ liệu phim...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      <MovieTabs nowShowing={nowShowing} comingSoon={comingSoon} defaultTab={defaultTab} reviews={reviews}/>
    </div>
  );
}
