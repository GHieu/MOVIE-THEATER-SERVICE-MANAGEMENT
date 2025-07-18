// pages/MovieDetailPage.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import useMovieDetail from '../hooks/useMovieDetail';
import SidebarNowShowing from "../components/MovieDetail/SidebarNowShowing";

// Import các component mới
import MovieBanner from "../components/MovieDetail/MovieBanner";
import TrailerModal from "../components/MovieDetail/TrailerModal";
import MovieDetailHeader from "../components/MovieDetail/MovieDetailHeader";
import MovieDescription from "../components/MovieDetail/MovieDescription";
import MovieShowtime from "../components/MovieDetail/MovieShowtime";

const MovieDetailPage = () => {
  const { id } = useParams();
  const { movie, loading, error } = useMovieDetail(id);
  const [showTrailer, setShowTrailer] = useState(false);

  const handlePlayTrailer = () => setShowTrailer(true);
  const handleCloseTrailer = () => setShowTrailer(false);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Đang tải thông tin phim...</div>;
  if (error || !movie) return <div className="text-center text-red-500 p-8">Không tìm thấy phim.</div>;

  return (
    <>
      {/* Banner phim */}
      <MovieBanner movie={movie} onPlayTrailer={handlePlayTrailer} />
      
      {/* Modal trailer */}
      <TrailerModal 
        show={showTrailer} 
        onClose={handleCloseTrailer} 
        movie={movie} 
      />
      
      {/* Nội dung chính */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-8 px-4 py-6">
          {/* Cột trái - Thông tin phim */}
          <div>
            {/* Header với poster và thông tin cơ bản */}
            <MovieDetailHeader movie={movie} />
            
            {/* Mô tả phim */}
            <MovieDescription movie={movie} />
            
            {/* Lịch chiếu */}
            <MovieShowtime movieId={movie.id} />
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <SidebarNowShowing />
          </aside>
        </div>
      </div>
    </>
  );
};

export default MovieDetailPage;