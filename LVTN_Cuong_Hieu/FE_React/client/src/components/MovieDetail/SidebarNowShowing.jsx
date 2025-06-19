import React from "react";
import { Link } from "react-router-dom";
import useNowShowingMovies from "../../hooks/useMovieUser"; 
import MovieCardDetailPage from "./MovieCardDetailPage";

const SidebarNowShowing = () => {
  const { nowShowing, loading, error } = useNowShowingMovies();

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">Lỗi khi tải phim đang chiếu</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold border-b pb-2">Phim Đang Chiếu</h3>

     
      {nowShowing.slice(0, 4).map((movie) => (
        <MovieCardDetailPage 
          key={movie.id} 
          movie={movie}  
        />
      ))}

      {/* Nút xem thêm */}
      <div className="pt-2">
        <Link
          to="/movies"
          className="border border-yellow-400 text-yellow-500 bg-white hover:bg-yellow-400 hover:text-white font-semibold px-6 py-2 rounded shadow-md  duration-300  transition"
        >
          Xem thêm →
        </Link>
      </div>
    </div>
  );
};

export default SidebarNowShowing;