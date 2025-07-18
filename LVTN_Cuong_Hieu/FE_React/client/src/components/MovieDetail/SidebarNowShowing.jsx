import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useNowShowingMovies from "../../hooks/useMovieUser";
import useRatingMovies from "../../hooks/useRatingMovies";
import MovieCardDetailPage from "./MovieCardDetailPage";

const SidebarNowShowing = () => {
  const { nowShowing, loading, error } = useNowShowingMovies();
  const { reviews, fetchReviews } = useRatingMovies();

  // Lấy tất cả review 1 lần khi mount
  useEffect(() => {
    fetchReviews(); // Gọi 1 lần để lấy reviews toàn bộ
  }, []);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">Lỗi khi tải phim đang chiếu</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-yellow-400 border-l-4 border-yellow-400 pl-2 text-2xl">
        PHIM ĐANG CHIẾU
      </h3>

      {nowShowing.slice(0, 4).map((movie) => {
        const reviewsForMovie = reviews.filter((r) => r.movie_id === movie.id);

        return (
          <MovieCardDetailPage
            key={movie.id}
            movie={movie}
            reviews={reviewsForMovie}
          />
        );
      })}

      <div className="pt-2">
        <Link
          to="/movies"
          className="border border-yellow-400 text-yellow-500 bg-white hover:bg-yellow-400 hover:text-white font-semibold px-6 py-2 rounded shadow-md transition duration-300"
        >
          Xem thêm →
        </Link>
      </div>
    </div>
  );
};

export default SidebarNowShowing;
