import React, { useState, useEffect, useMemo } from 'react';
import RatingModal from './RatingModal';
import useRatingMovies from '../../hooks/useRatingMovies';
import LoginModal from '../../components/MovieNavbar/LoginModal';

const MovieInfo = ({ movie }) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const {
    addNewReview,
    fetchReviews,
    reviews,
    isLoading,
    error,
    success,
    resetState,
  } = useRatingMovies();

  useEffect(() => {
    if (movie?.id) {
      fetchReviews();
    }
  }, [movie?.id]);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const handleRatingSubmit = async (rating) => {
    try {
      await addNewReview({ movie_id: movie?.id, rating });
      setShowRatingModal(false);
    } catch (err) {
      console.error('Lỗi khi gửi đánh giá:', err);
    }
  };
  
  const isUserLoggedIn = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return !!token;
  };

  const handleModalClose = () => {
    setShowRatingModal(false);
    resetState();
  };

  // 🔸 Lọc tất cả review của phim hiện tại
  const movieReviews = useMemo(() => {
    return reviews.filter((r) => r.movie?.id === movie?.id);
  }, [reviews, movie?.id]);

  // 🔸 Tính trung bình đánh giá và số lượt đánh giá
  const totalVotes = movieReviews.length;
  const avgRating = totalVotes > 0
    ? (movieReviews.reduce((sum, r) => sum + r.rating, 0) / totalVotes).toFixed(1)
    : null;

  return (
    <div className="flex-1 flex flex-col justify-between h-full mt-14">
      {/* Container cho tiêu đề và age badge */}
      <div className="space-y-2">
        {/* Title và age badge trên cùng một dòng */}
        <div className="flex items-start gap-2">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {movie?.title || 'Ma Không Đầu'}
          </h1>
          {movie?.age && (
            <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded flex-shrink-0 mt-1 min-w-[0px] text-center">
              {movie.age}
            </span>
          )}
        </div>

        {/* Thông tin thời gian và ngày phát hành */}
        <div className="flex items-center text-sm text-gray-600 gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="text-orange-500">⏱</span>
            {movie?.duration || 115} Phút
          </span>
          <span className="flex items-center gap-1">
            <span className="text-orange-500">📅</span>
            {movie?.release_date || "27/06/2025"}
          </span>
        </div>

        {/* Rating section */}
        <div
          className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-all duration-200"
          onClick={() => {
            if (isUserLoggedIn()) {
              setShowRatingModal(true);
            } else {
              setShowLoginModal(true);
            }
          }}
        >
          <span className="text-lg">⭐</span>
          <span className="text-lg font-semibold hover:text-amber-400">{avgRating || "0"}</span>
          <span className="text-gray-500 text-sm">({totalVotes} votes)</span>
        </div>
      </div>

      {/* Modal đánh giá */}
      <RatingModal
        visible={showRatingModal}
        onClose={handleModalClose}
        onSubmit={handleRatingSubmit}
        movie={movie}
        isLoading={isLoading}
        error={error}
        success={success}
        reviews={movieReviews}
      />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          console.log('Switch to register modal');
        }}
        refreshUser={() => {
          console.log('Refresh after login');
          setShowLoginModal(false);
          setShowRatingModal(true); // Tiếp tục hiện RatingModal sau login
        }}
      />

      {/* Thông tin chi tiết */}
      <div className="space-y-2.5 mt-4">
        <div className="flex items-start gap-3">
          <span className="text-gray-600 font-medium min-w-[100px]">Quốc gia:</span>
          <span className="text-gray-800">{movie?.nation || "Việt Nam"}</span>
        </div>
        
        <div className="flex items-start gap-3">
          <span className="text-gray-600 font-medium min-w-[100px]">Nhà sản xuất:</span>
          <span className="text-gray-800">{movie?.studio || "Ai Media"}</span>
        </div>
        
        <div className="flex items-start gap-3">
          <span className="text-gray-600 font-medium min-w-[100px]">Thể loại:</span>
          <div className="flex gap-2 flex-wrap">
            {(movie?.genre || "Kinh Dị").split(',').map((genre, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                {genre.trim()}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <span className="text-gray-600 font-medium min-w-[100px]">Đạo diễn:</span>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
            {movie?.director || "Bùi Văn Hải"}
          </span>
        </div>
        
        <div className="flex items-start gap-3">
          <span className="text-gray-600 font-medium min-w-[100px]">Diễn viên:</span>
          <div className="flex gap-2 flex-wrap">
            {(movie?.cast || "Ngô Kiến Huy,Đại Nghĩa").split(',').map((actor, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                {actor.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;