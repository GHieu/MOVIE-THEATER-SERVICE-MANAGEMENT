import React, { useState, useEffect, useMemo } from 'react';

const RatingModal = ({
  visible,
  onClose,
  onSubmit,
  movie,
  isLoading,
  error,
  success,
  reviews = [], // ⬅️ thêm default []
}) => {
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Tính trung bình và số lượt vote
  const totalVotes = reviews.length;
  const avgRating = useMemo(() => {
    if (totalVotes === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / totalVotes).toFixed(1);
  }, [reviews]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [success, onClose]);

  if (!visible) return null;

  const handleStarClick = (rating) => setUserRating(rating);
  const handleStarHover = (rating) => setHoveredRating(rating);
  const handleStarLeave = () => setHoveredRating(0);
  const handleConfirm = async () => {
    if (userRating > 0 && onSubmit) await onSubmit(userRating);
  };
  const handleClose = () => {
    setUserRating(0);
    setHoveredRating(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <div className="h-2 -mt-6 -mx-6 mb-4 bg-yellow-400 rounded-t-lg" />

        {/* Nút đóng */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50"
        >
          <span className="text-gray-600 text-lg">×</span>
        </button>
          
        {/* Ảnh banner */}
        {movie?.banner && (
        <div className="-mx-6 -mt-4 mb-6 overflow-hidden  bg-black">
            <img
            src={movie.banner}
            alt={movie.title}
            className="w-full h-full object-fill"
            />
        </div>
        )}


        {/* Tiêu đề */}
        <h2 className="text-xl font-bold text-center mb-6">{movie?.title || 'Ma Không Đầu'}</h2>

        {/* Thông báo thành công */}
        {success && (
          <div className="text-center mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-600 font-medium">✅ Đánh giá của bạn đã được gửi!</div>
          </div>
        )}

        {/* Thông báo lỗi */}
        {error && (
          <div className="text-center mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {/* Điểm trung bình */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto border-2 border-blue-300 rounded-full flex items-center justify-center mb-4 hover:shadow-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-orange-500 text-lg">⭐</span>
                <span className="text-2xl font-bold">{avgRating || '0'}</span>
              </div>
              <div className="text-xs text-gray-500">({totalVotes} đánh giá)</div>
            </div>
          </div>
        </div>

        {/* Các sao */}
        <div className="flex justify-center gap-1 mb-6 p-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
            const isActive = star <= (hoveredRating || userRating);
            const isHovered = star <= hoveredRating;
            return (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={handleStarLeave}
                disabled={isLoading || success}
                className="relative p-1 transition-all duration-200 hover:scale-125 disabled:opacity-50"
                style={{ transform: isHovered ? `scale(1.2) translateY(-2px)` : 'scale(1)' }}
              >
                <span
                  className={`text-2xl ${
                    isActive ? 'text-orange-400 drop-shadow-lg' : 'text-gray-300'
                  }`}
                >
                  ⭐
                </span>
                {isHovered && !isLoading && !success && (
                  <div className="absolute inset-0 rounded-full bg-orange-200 opacity-30 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Hiển thị số điểm chọn */}
        <div className="text-center mb-4 h-8 flex items-center justify-center">
          {(userRating > 0 || hoveredRating > 0) && !success && (
            <div className="animate-bounce-subtle">
              <span className="text-lg font-semibold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                {hoveredRating || userRating}/10
              </span>
            </div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            {success ? 'Đóng' : 'Hủy'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={userRating === 0 || isLoading || success}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition duration-200 ${
              userRating > 0 && !isLoading && !success
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Đang gửi...' : success ? '✅ Thành công' : 'Xác Nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
