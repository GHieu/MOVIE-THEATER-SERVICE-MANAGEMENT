import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from './MovieShowtimeCard';
import LoginModal from '../MovieNavbar/LoginModal'; // Import LoginModal
import RegisterModal from '../MovieNavbar/RegisterModal'; // Import RegisterModal

export default function ShowtimeCard({ movie, showtimes = [], selectedDate, reviews = [] }) {
  const navigate = useNavigate();
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  
  // State cho cả 2 modal - giống như trong ShowTimeTabs
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Hàm chuyển đổi room type
  const translateRoomType = (roomType) => {
    const roomTypeMap = {
      '2Dsub': '2D Phụ đề',
      '2Dcap': '2D Lồng tiếng',
      '3Dsub': '3D Phụ đề',
      '3Dcap': '3D Lồng tiếng',
      'IMAXsub': 'IMAX Phụ đề',
      'IMAXcap': 'IMAX Lồng tiếng',
      // Các loại phòng khác
      'Standard': 'Phòng tiêu chuẩn',
      'VIP': 'Phòng VIP',
      'Premium': 'Phòng cao cấp',
      'Gold': 'Phòng Gold',
      'Platinum': 'Phòng Platinum',
      'Director': 'Phòng đạo diễn',
      'Couple': 'Phòng đôi',
      'Family': 'Phòng gia đình'
    };
    
    return roomTypeMap[roomType] || roomType || 'Khác';
  };

  // Hàm kiểm tra trạng thái đăng nhập (giống ShowTimeTabs)
  const isUserLoggedIn = () => {
    // Kiểm tra token trong localStorage hoặc cookie
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return !!token;
    
    // Hoặc nếu bạn sử dụng context/redux để quản lý user state:
    // return !!user || !!currentUser;
  };

  // Hàm xử lý khi đăng nhập thành công
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    // Tiếp tục với booking nếu có showtime được chọn
    if (selectedShowtime) {
      proceedToBooking(selectedShowtime);
      setSelectedShowtime(null);
    }
  };

  // Hàm đóng tất cả modal - giống như trong ShowTimeTabs
  const handleCloseModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    setSelectedShowtime(null);
  };

  // Hàm chuyển từ Login sang Register - giống như trong ShowTimeTabs
  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  // Hàm chuyển từ Register sang Login - giống như trong ShowTimeTabs
  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // Hàm refresh user data - có thể được gọi từ cả 2 modal
  const refreshUser = () => {
    console.log('Refresh user data');
    handleLoginSuccess();
  };

  // Hàm thực hiện chuyển hướng đến trang booking
  const proceedToBooking = (showtime) => {
    if (!showtime.id) return;

    navigate(`/booking/${movie.id}`, {
      state: {
        date: selectedDate,
        time: showtime.start_time || showtime.show_time,
        showtime,
      },
    });
  };

  const groupedByRoomType = useMemo(() => {
    return showtimes.reduce((acc, st) => {
      const type = st.room?.type || "Khác";
      const translatedType = translateRoomType(type);
      if (!acc[translatedType]) acc[translatedType] = [];
      acc[translatedType].push(st);
      return acc;
    }, {});
  }, [showtimes]);

  // Xử lý khi click vào suất chiếu
  const handleClickShowtime = (showtime) => {
    // Kiểm tra đăng nhập
    if (!isUserLoggedIn()) {
      // Lưu showtime được chọn và hiển thị modal đăng nhập
      setSelectedShowtime(showtime);
      setIsLoginModalOpen(true);
      return;
    }

    // Nếu đã đăng nhập, chuyển thẳng đến booking
    proceedToBooking(showtime);
  };

  // Hàm đóng LoginModal
  const handleCloseLoginModal = () => {
    handleCloseModals();
  };

  // Format time from datetime string
  const formatTime = (datetime) => {
    if (!datetime) return '';
    try {
      const date = new Date(datetime);
      if (isNaN(date.getTime())) {
        console.warn('Invalid time string:', datetime);
        return '';
      }
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  // Format duration
  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    if (typeof duration === 'string' && duration.includes('phút')) {
      return duration;
    }
    return `${duration} phút`;
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="flex gap-4">
        {/* Movie Poster */}
        <div className="flex-shrink-0">
          <MovieCard movie={movie} reviews={reviews} />
        </div>

        {/* Movie Info and Showtimes */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{movie.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <span className="text-blue-600">🎬</span>
                  {movie.genre || movie.genres || 'Phim chiếu rạp'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-orange-500">⏱</span>
                  {formatDuration(movie.duration)}
                </span>
                {movie.nation && (
                  <span className="flex items-center gap-1">
                    <span className="text-purple-600">🌐</span>
                    {movie.nation}
                  </span>
                )}
              </div>
              
              {movie.description && (
                <p className="text-sm text-gray-600 line-clamp-2 max-w-2xl">
                  {movie.description}
                </p>
              )}
            </div>
            
            {(movie.rating || movie.imdb_rating) && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-yellow-500">⭐</span>
                <span className="font-semibold">{movie.rating || movie.imdb_rating}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            {movie.director && (
              <span>Đạo diễn: <span className="text-gray-700">{movie.director}</span></span>
            )}
            {movie.cast && (
              <span>Diễn viên: <span className="text-gray-700">{movie.cast}</span></span>
            )}
            {movie.studio && (
              <span>Nhà sản xuất: <span className="text-gray-700">{movie.studio}</span></span>
            )}
            {movie.release_date && (
              <span>Khởi chiếu: <span className="text-gray-700">
                {new Date(movie.release_date).toLocaleDateString('vi-VN')}
              </span></span>
            )}
          </div>

          <div>
            {Object.entries(groupedByRoomType).map(([roomType, group]) => (
              <div key={roomType} className="mb-6">
                <div className="mb-3">
                  <span className="text-lg font-semibold text-gray-700">{roomType}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {group.map(showtime => (
                    <button
                      key={showtime.id}
                      onClick={() => handleClickShowtime(showtime)}
                      className="border-2 border-gray-300 px-4 py-2 rounded-md hover:border-black hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="text-lg font-bold text-gray-800">
                        {formatTime(showtime.start_time)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {showtime.room?.name || 'Phòng chiếu'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LoginModal với khả năng chuyển đổi - giống như trong ShowTimeTabs */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseModals}
        onSwitchToRegister={handleSwitchToRegister}
        refreshUser={refreshUser}
      />

      {/* RegisterModal với khả năng chuyển đổi - giống như trong ShowTimeTabs */}
      <RegisterModal 
        isOpen={isRegisterModalOpen}
        onClose={handleCloseModals}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
}