import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useShowtimes from "../../hooks/useShowtimes";

const ShowTimeTabs = () => {
  const { id: movieId } = useParams();
  const navigate = useNavigate();
  const { showtimes, loadShowtimesByMovie, groupShowtimesByDate, loading, error } = useShowtimes();
  const [selectedDate, setSelectedDate] = useState("");

  // Hàm kiểm tra ngày hợp lệ
  const isValidDate = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  // Hàm định dạng ngày cho tab hiển thị
  const formatDateForDisplay = (dateStr) => {
    if (!isValidDate(dateStr)) {
      console.warn('Invalid date string in formatDateForDisplay:', dateStr);
      return null;
    }

    try {
      const date = new Date(dateStr);
      const today = new Date();
      
      // So sánh ngày (bỏ qua thời gian)
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = dateOnly.getTime() === todayOnly.getTime();

      // Tính toán ngày mai
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
      const isTomorrow = dateOnly.getTime() === tomorrowOnly.getTime();

      let label;
      if (isToday) {
        // Hiển thị "Hôm nay - DD/M" (ví dụ: "Hôm nay - 20/6")
       
        label = `Hôm Nay `;
      } else if (isTomorrow) {
        label = "Ngày Mai";
      } else {
        // Đối với các ngày khác, lấy ngày/tháng và thứ
        
        label = `${["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][date.getDay()]} `;
      }

      return {
        key: dateStr, // YYYY-MM-DD format
        label: label,
        weekday: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "numeric" }), // Giữ weekday để debug hoặc sử dụng khác
        dateObj: date, // Để sắp xếp
        isToday: isToday,
        isTomorrow: isTomorrow
      };
    } catch (error) {
      console.error('Error in formatDateForDisplay:', error, 'Input:', dateStr);
      return null;
    }
  };

  // Memoize các tính toán để tránh re-render không cần thiết
  const availableDates = useMemo(() => {
    const grouped = groupShowtimesByDate();
    console.log('Grouped showtimes:', grouped);
    console.log('All showtimes data:', showtimes);

    // Debug: Kiểm tra format ngày
    showtimes.forEach(showtime => {
      const originalDate = showtime.start_time || showtime.show_date;
      const parsedDate = new Date(originalDate);
      const localDateKey = parsedDate.getFullYear() + '-' + 
        String(parsedDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(parsedDate.getDate()).padStart(2, '0');
      console.log(`Original: ${originalDate} -> Parsed: ${parsedDate} -> Key: ${localDateKey}`);
    });

    // Lọc và sắp xếp các ngày
    const sortedDateKeys = Object.keys(grouped)
      .filter(dateStr => isValidDate(dateStr))
      .sort((a, b) => new Date(a) - new Date(b));

    console.log('Sorted date keys:', sortedDateKeys);

    const dates = sortedDateKeys
      .map(dateStr => formatDateForDisplay(dateStr))
      .filter(dateInfo => dateInfo !== null)
      .sort((a, b) => a.dateObj - b.dateObj);

    console.log('Available dates:', dates);
    return dates;
  }, [showtimes]);

  // Load suất chiếu theo movieId - chỉ chạy khi movieId thay đổi
  useEffect(() => {
    if (movieId) {
      console.log('Loading showtimes for movie:', movieId);
      loadShowtimesByMovie(movieId);
    }
  }, [movieId]);

  // Tự động chọn ngày đầu tiên (ưu tiên hôm nay) khi có dữ liệu
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      const todayDate = availableDates.find(date => date.isToday);
      if (todayDate) {
        setSelectedDate(todayDate.key);
      } else {
        setSelectedDate(availableDates[0].key);
      }
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

  // Lọc suất chiếu cho ngày hiện tại (chỉ hiển thị suất chiếu chưa qua)
  const filterShowtimesForToday = (showtimes, isToday) => {
    if (!isToday || !Array.isArray(showtimes)) return showtimes;
    
    const now = new Date();
    console.log('Current time:', now);
    
    return showtimes.filter(showtime => {
      const showtimeDate = new Date(showtime.start_time || showtime.show_time);
      console.log('Showtime:', showtime.start_time || showtime.show_time, 'Parsed date:', showtimeDate, 'Is future?', showtimeDate > now);
      
      if (isNaN(showtimeDate.getTime())) {
        console.warn('Invalid showtime date:', showtime.start_time || showtime.show_time);
        return true;
      }
      
      const bufferTime = 30 * 60 * 1000; // 30 phút
      return showtimeDate.getTime() > (now.getTime() - bufferTime);
    });
  };

  // Xử lý khi click vào suất chiếu
  const handleClickShowtime = (showtime) => {
    if (!showtime.id) return;

    navigate(`/booking/${movieId}`, {
      state: {
        date: selectedDate,
        time: showtime.start_time || showtime.show_time,
        showtime,
      },
    });
  };

  // Memoize suất chiếu được sắp xếp
  const sortedShowtimes = useMemo(() => {
    const grouped = groupShowtimesByDate();
    const selectedDateInfo = availableDates.find(date => date.key === selectedDate);
    const showtimesForSelectedDate = grouped[selectedDate] || [];
    
    console.log('Showtimes for selected date:', selectedDate, showtimesForSelectedDate);
    console.log('Selected date info:', selectedDateInfo);
    
    // Tạm thời tắt filter cho hôm nay để debug
    const filteredShowtimes = showtimesForSelectedDate; // Hiển thị tất cả suất chiếu
    
    console.log('Filtered showtimes:', filteredShowtimes);
    
    return sortShowtimesByTime(filteredShowtimes);
  }, [selectedDate, showtimes, availableDates]);

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

  // Không có suất chiếu
  if (availableDates.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-lg text-gray-600">Không có suất chiếu nào cho phim này.</div>
      </div>
    );
  }

  const selectedDateInfo = availableDates.find(date => date.key === selectedDate);

  return (
    <div className="p-4">
      {/* Tabs ngày */}
      <div className="flex gap-4 border-b pb-2 overflow-x-auto">
        {availableDates.map(({ key, label, weekday, isToday }) => (
          <button
            key={key}
            onClick={() => setSelectedDate(key)}
            className={`text-center px-3 py-2 font-bold border-b-2 whitespace-nowrap transition-colors ${
              selectedDate === key
                ? "text-blue-600 border-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            } ${isToday ? "bg-blue-50" : ""}`}
          >
            <div className={`${isToday ? "text-blue-600 font-bold" : ""}`}>{label}</div>
            <div className="text-sm">{weekday}</div>
          </button>
        ))}
      </div>

      {/* Danh sách suất chiếu */}
      <div className="mt-4">
        <div className="font-semibold text-xl mb-2">2D Phụ đề</div>
        <div className="flex gap-4 flex-wrap">
          {sortedShowtimes.map((st) => (
            <div
              key={st.id}
              onClick={() => handleClickShowtime(st)}
              className="border px-4 py-2 rounded-md shadow-sm hover:shadow-md cursor-pointer transition-shadow hover:border-blue-300"
            >
              <div className="text-lg font-bold">
                {formatTime(st.start_time || st.show_time)}
              </div>
              <div className="text-sm text-gray-500">
                {st.room?.seat_count || st.available_seats || 0} ghế trống
              </div>
            </div>
          ))}
        </div>
        
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
    </div>
  );
};

export default ShowTimeTabs;