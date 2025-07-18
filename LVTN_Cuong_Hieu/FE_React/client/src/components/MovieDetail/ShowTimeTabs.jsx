import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useShowtimes from "../../hooks/useShowtimes";
import LoginModal from "../../components/MovieNavbar/LoginModal";
import RegisterModal from "../../components/MovieNavbar/RegisterModal"; // Import RegisterModal

const ShowTimeTabs = () => {
  const { id: movieId } = useParams();
  const navigate = useNavigate();
  const { showtimes, loadShowtimesByMovie, groupShowtimesByDate, loading, error } = useShowtimes();
  const [selectedDate, setSelectedDate] = useState("");
  
  // State cho cả 2 modal - giống như trong Navbar
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  // Mapping room type từ BE sang tên hiển thị
  const getRoomTypeName = (type) => {
    const roomTypeMap = {
      '2Dsub': '2D Phụ đề',
      '2Dcap': '2D Lồng tiếng',
      '3Dsub': '3D Phụ đề',
      '3Dcap': '3D Lồng tiếng',
      'IMAXsub': 'IMAX Phụ đề',
      'IMAXcap': 'IMAX Lồng tiếng'
    };
    
    return roomTypeMap[type] || type || 'Khác';
  };

  // Hàm kiểm tra trạng thái đăng nhập
  const isUserLoggedIn = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return !!token;
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

  // Hàm thực hiện chuyển hướng đến trang booking
  const proceedToBooking = (showtime) => {
    if (!showtime.id) return;

    navigate(`/booking/${movieId}`, {
      state: {
        date: selectedDate,
        time: showtime.start_time || showtime.show_time,
        showtime,
      },
    });
  };

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

  // Hàm đóng tất cả modal - giống như trong Navbar
  const handleCloseModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    setSelectedShowtime(null);
  };

  // Hàm chuyển từ Login sang Register - giống như trong Navbar
  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  // Hàm chuyển từ Register sang Login - giống như trong Navbar
  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // Hàm refresh user data - có thể được gọi từ cả 2 modal
  const refreshUser = () => {
    console.log('Refresh user data');
    handleLoginSuccess();
  };

  // Tạo danh sách 7 ngày liên tiếp từ hôm nay (giống DateTabs)
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    
    // Fix: Đảm bảo sử dụng múi giờ địa phương nhất quán
    const todayDateString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    console.log('Today date string:', todayDateString);
    
    for (let i = 0; i < 7; i++) {
      // Tạo ngày bằng cách thêm ngày trực tiếp thay vì dùng setDate
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
      
      console.log(`Date ${i}:`, {
        dateStr,
        dayName,
        dayMonth,
        isToday: i === 0
      });
      
      dates.push({
        key: dateStr,
        label: i === 0 ? 'Hôm Nay' : dayName,
        dayMonth: dayMonth,
        isToday: i === 0
      });
    }
    
    return dates;
  }, []);

  // Load suất chiếu theo movieId
  useEffect(() => {
    if (movieId) {
      console.log('Loading showtimes for movie:', movieId);
      loadShowtimesByMovie(movieId);
    }
  }, [movieId]);

  // Tự động chọn ngày đầu tiên (hôm nay)
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0].key); // Luôn chọn hôm nay đầu tiên
    }
  }, [availableDates, selectedDate]);

  // Hàm format thời gian an toàn
  const formatTime = (timeStr) => {
    if (!timeStr) return "00:00";
    
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) {
        console.warn('Invalid time string:', timeStr);
        return "00:00";
      }
      
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error('Error formatting time:', error, 'Input:', timeStr);
      return "00:00";
    }
  };

  // Sắp xếp suất chiếu theo thời gian
  const sortShowtimesByTime = (showtimes) => {
    if (!Array.isArray(showtimes)) return [];
    
    return showtimes.sort((a, b) => {
      const timeA = new Date(a.start_time || a.show_time);
      const timeB = new Date(b.start_time || b.show_time);
      
      if (isNaN(timeA.getTime())) return 1;
      if (isNaN(timeB.getTime())) return -1;
      
      return timeA - timeB;
    });
  };

  // Lọc và sắp xếp suất chiếu theo ngày được chọn
  const sortedShowtimes = useMemo(() => {
    const grouped = groupShowtimesByDate();
    const showtimesForSelectedDate = grouped[selectedDate] || [];
    
    console.log('Showtimes for selected date:', selectedDate, showtimesForSelectedDate);
    
    return sortShowtimesByTime(showtimesForSelectedDate);
  }, [selectedDate, showtimes]);

  // Hiển thị loading
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-lg">Đang tải suất chiếu...</div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <div className="text-lg">{error}</div>
      </div>
    );
  }

  const selectedDateInfo = availableDates.find(date => date.key === selectedDate);

  return (
    <div>
      {/* Tabs ngày - Sử dụng logic giống DateTabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {availableDates.map(({ key, label, dayMonth, isToday }) => {
          const isActive = selectedDate === key;
          
          console.log(`Tab ${key}: selected=${selectedDate}, active=${isActive}`);
          
          return (
            <button
              key={key}
              onClick={() => setSelectedDate(key)}
              className={`w-28 px-4 py-3 rounded-xl transition-all whitespace-nowrap font-semibold text-sm border-2 ${
                isActive
                  ? "bg-amber-300 text-white border-amber-400"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="text-lg">{label}</div>
              <div className="text-xs opacity-80">{dayMonth}</div>
            </button>
          );
        })}
      </div>
      
      <div className="block border-b-4 border-yellow-400"></div>
      
      {/* Danh sách suất chiếu */}
      <div className="mt-4">
        {Object.entries(
          sortedShowtimes.reduce((groups, st) => {
            const roomType = getRoomTypeName(st.room?.type);
            if (!groups[roomType]) groups[roomType] = [];
            groups[roomType].push(st);
            return groups;
          }, {})
        ).map(([roomType, times]) => (
          <div key={roomType} className="mb-6">
            <div className="font-semibold text-xl mb-3">{roomType}</div>
            <div className="flex gap-4 flex-wrap">
              {times.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleClickShowtime(st)}
                  className="border px-4 py-2 rounded-md shadow-sm hover:shadow-md cursor-pointer transition-shadow hover:border-black hover:bg-gray-100"
                >
                  <div className="text-lg font-bold">
                    {formatTime(st.start_time || st.show_time)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        
        {/* Hiển thị khi không có suất chiếu cho ngày được chọn */}
        {sortedShowtimes.length === 0 && (
          <div className="text-gray-600 mt-4">
            {selectedDateInfo?.isToday 
              ? "Không có suất chiếu nào còn lại cho hôm nay."
              : "Không có suất chiếu nào cho ngày này."
            }
          </div>
        )}
      </div>

      {/* LoginModal với khả năng chuyển đổi - giống như trong Navbar */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseModals}
        onSwitchToRegister={handleSwitchToRegister}
        refreshUser={refreshUser}
      />

      {/* RegisterModal với khả năng chuyển đổi - giống như trong Navbar */}
      <RegisterModal 
        isOpen={isRegisterModalOpen}
        onClose={handleCloseModals}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default ShowTimeTabs;