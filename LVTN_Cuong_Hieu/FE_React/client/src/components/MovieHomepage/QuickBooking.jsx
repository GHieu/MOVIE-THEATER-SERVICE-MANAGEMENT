import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import useShowtimes from '../../hooks/useShowtimes';
import useMoviesUser from '../../hooks/useMovieUser';
import LoginModal from '../../components/MovieNavbar/LoginModal';
import RegisterModal from '../../components/MovieNavbar/RegisterModal';

const CinemaNavigation = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  // State cho cả 2 modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(null);

  const navigate = useNavigate();

  // Hooks
  const { nowShowing } = useMoviesUser();
  const { 
    showtimes, 
    loading, 
    error, 
    loadShowtimesByMovie,
    getAvailableTimesForDate,
    findShowtimeByDateTime
  } = useShowtimes();

  // Tạo danh sách 7 ngày từ hôm nay
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    
    // Đảm bảo sử dụng múi giờ địa phương nhất quán
    const todayDateString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    console.log('Today date string:', todayDateString);
    
    for (let i = 0; i < 7; i++) {
      // Tạo ngày bằng cách thêm ngày trực tiếp
      const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      
      // Tạo date string theo format YYYY-MM-DD
      const dateStr = currentDate.getFullYear() + '-' + 
        String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(currentDate.getDate()).padStart(2, '0');
      
      // Lấy tên ngày và ngày/tháng
      const dayName = currentDate.toLocaleDateString('vi-VN', { weekday: 'long' });
      const dayMonth = currentDate.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: 'numeric' 
      });
      
      dates.push({
        value: dateStr,
        label: dayName,
        dayMonth: dayMonth,
        isToday: i === 0,
        displayLabel:  `${dayName}, ${dayMonth}`
      });
    }
    
    return dates;
  }, []);

  // Lọc ngày có suất chiếu thực tế
  const getAvailableDatesWithShowtimes = useMemo(() => {
    if (!Array.isArray(showtimes) || showtimes.length === 0) {
      return availableDates; // Trả về tất cả 7 ngày nếu chưa có dữ liệu
    }

    // Lọc ra các ngày có suất chiếu thực tế
    const showtimeDates = new Set();
    showtimes.forEach(showtime => {
      const dateSource = showtime.start_time || showtime.show_date;
      if (!dateSource) return;

      const showtimeDate = new Date(dateSource);
      const dateKey = showtimeDate.getFullYear() + '-' + 
        String(showtimeDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(showtimeDate.getDate()).padStart(2, '0');
      
      showtimeDates.add(dateKey);
    });

    // Chỉ giữ lại những ngày có suất chiếu
    return availableDates.filter(date => showtimeDates.has(date.value));
  }, [availableDates, showtimes]);

  // Load showtimes khi chọn phim
  useEffect(() => {
    if (selectedMovie?.id) {
      loadShowtimesByMovie(selectedMovie.id);
    }
  }, [selectedMovie, loadShowtimesByMovie]);

  // Reset selectedDate khi không có suất chiếu
  useEffect(() => {
    if (selectedDate && getAvailableDatesWithShowtimes.length > 0) {
      const isDateAvailable = getAvailableDatesWithShowtimes.some(date => date.value === selectedDate);
      if (!isDateAvailable) {
        setSelectedDate(null);
        setSelectedTime(null);
      }
    }
  }, [selectedDate, getAvailableDatesWithShowtimes]);

  // Hàm kiểm tra trạng thái đăng nhập
  const isUserLoggedIn = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return !!token;
  };

  // Hàm xử lý khi đăng nhập thành công
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    
    if (pendingBookingData) {
      proceedToBooking(pendingBookingData);
      setPendingBookingData(null);
    }
  };

  // Hàm thực hiện chuyển hướng đến trang booking
  const proceedToBooking = ({ movie, date, time, showtime }) => {
    if (!movie?.id || !showtime?.id) return;

    navigate(`/booking/${movie.id}`, {
      state: {
        date: date,
        time: showtime.start_time || showtime.show_time,
        showtime: showtime,
      },
    });
  };

  // Hàm đóng tất cả modal
  const handleCloseModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    setPendingBookingData(null);
  };

  // Hàm chuyển từ Login sang Register
  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  // Hàm chuyển từ Register sang Login
  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // Lấy danh sách thời gian có sẵn cho ngày đã chọn
  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    return getAvailableTimesForDate(selectedDate);
  }, [selectedDate, getAvailableTimesForDate]);

  // Kiểm tra điều kiện để enable/disable từng dropdown
  const isDateEnabled = selectedMovie !== null && !loading && getAvailableDatesWithShowtimes.length > 0;
  const isTimeEnabled = selectedMovie !== null && selectedDate !== null && !loading && availableTimes.length > 0;

  const dropdownItems = [
    {
      id: 1,
      label: selectedMovie ? selectedMovie.title : "Chọn Phim",
      icon: "🎬",
      options: nowShowing || [],
      enabled: true,
      placeholder: "Vui lòng chọn phim"
    },
    {
      id: 2,
      label: selectedDate 
        ? getAvailableDatesWithShowtimes.find(d => d.value === selectedDate)?.displayLabel || "Chọn Ngày"
        : "Chọn Ngày",
      icon: "📅",
      options: getAvailableDatesWithShowtimes,
      enabled: isDateEnabled,
      placeholder: selectedMovie 
        ? (loading ? "Đang tải ngày chiếu..." : 
           getAvailableDatesWithShowtimes.length === 0 ? "Không có suất chiếu" : "Vui lòng chọn ngày")
        : "Chọn phim trước"
    },
    {
      id: 3,
      label: selectedTime || "Chọn Suất",
      icon: "🕐",
      options: availableTimes.map(item => ({ label: item.time, value: item.time })),
      enabled: isTimeEnabled,
      placeholder: !selectedMovie ? "Chọn phim trước" : 
                   !selectedDate ? "Chọn ngày trước" : 
                   loading ? "Đang tải suất chiếu..." :
                   availableTimes.length === 0 ? "Không có suất chiếu" : "Vui lòng chọn suất chiếu"
    }
  ];

  const toggleDropdown = (id) => {
    const item = dropdownItems.find(item => item.id === id);
    if (!item.enabled) return;
    
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const selectOption = (dropdownId, option) => {
    switch(dropdownId) {
      case 1: // Phim
        setSelectedMovie(option);
        setSelectedDate(null);
        setSelectedTime(null);
        break;
      case 2: // Ngày
        setSelectedDate(option.value);
        setSelectedTime(null);
        break;
      case 3: // Suất chiếu
        setSelectedTime(option.value || option);
        break;
    }
    setActiveDropdown(null);
  };

  // Hàm xử lý mua vé nhanh với kiểm tra đăng nhập
  const handleQuickBooking = () => {
    if (!selectedMovie || !selectedDate || !selectedTime) {
      alert('Vui lòng chọn đầy đủ thông tin!');
      return;
    }

    // Tìm showtime cụ thể
    const specificShowtime = findShowtimeByDateTime(selectedDate, selectedTime);
    
    if (!specificShowtime) {
      alert('Không tìm thấy suất chiếu phù hợp!');
      return;
    }

    const bookingData = {
      movie: selectedMovie,
      date: selectedDate,
      time: selectedTime,
      showtime: specificShowtime
    };

    // Kiểm tra đăng nhập
    if (!isUserLoggedIn()) {
      // Lưu thông tin booking và hiển thị modal đăng nhập
      setPendingBookingData(bookingData);
      setIsLoginModalOpen(true);
      return;
    }

    // Nếu đã đăng nhập, chuyển thẳng đến booking
    proceedToBooking(bookingData);
  };

  return (
    <>
      <div className="hidden lg:inline-flex bg-white shadow-lg w-[1250px]">
        <div className="flex items-center gap-4 w-full">
          {/* Navigation Items */}
          {dropdownItems.map((item, index) => (
            <div key={item.id} className="relative flex-1">
              {/* Dropdown Button */}
              <button
                onClick={() => toggleDropdown(item.id)}
                className={`w-full h-12 flex items-center space-x-2 px-4 py-2 transition-colors duration-200 justify-between ${
                  item.enabled 
                    ? 'hover:bg-gray-50 cursor-pointer' 
                    : 'cursor-not-allowed opacity-50 bg-gray-100'
                }`}
                disabled={loading}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className={`font-medium truncate ${
                    item.enabled ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {loading && item.id > 1 ? 'Đang tải...' : item.label}
                  </span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    item.enabled ? 'text-gray-500' : 'text-gray-300'
                  } ${
                    activeDropdown === item.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {activeDropdown === item.id && item.enabled && (
                <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto">
                  {item.options.length === 0 ? (
                    <div className="px-4 py-2 text-gray-500 text-center">
                      {item.placeholder}
                    </div>
                  ) : (
                    item.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => selectOption(item.id, option)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {/* Hiển thị đặc biệt cho ngày */}
                        {item.id === 2 ? (
                          <div className="flex flex-col">
                            <span className="text-gray-700 font-medium">
                              {option.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {option.dayMonth}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-700">
                            {item.id === 1 ? option.title : 
                             option.label || option}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Buy Ticket Button */}
          <button 
            onClick={handleQuickBooking}
            disabled={!selectedMovie || !selectedDate || !selectedTime || loading}
            className="flex-1 h-12 bg-amber-400 hover:bg-orange-500 disabled:bg-amber-600 disabled:cursor-not-allowed text-black font-semibold px-6 py-2 transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
          >
            {loading ? 'Đang tải...' : 'Mua vé nhanh'}
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="absolute top-full left-0 right-0 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-1">
            {error}
          </div>
        )}
        
        {/* Overlay to close dropdowns */}
        {activeDropdown && (
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setActiveDropdown(null)}
          />
        )}
      </div>

      {/* LoginModal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseModals}
        onSwitchToRegister={handleSwitchToRegister}
        refreshUser={() => {
          console.log('Refresh user data');
          handleLoginSuccess();
        }}
      />

      {/* RegisterModal */}
      <RegisterModal 
        isOpen={isRegisterModalOpen}
        onClose={handleCloseModals}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
};

export default CinemaNavigation;