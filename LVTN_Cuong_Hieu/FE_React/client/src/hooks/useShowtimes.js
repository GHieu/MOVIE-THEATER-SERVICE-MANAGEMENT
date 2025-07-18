import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  fetchShowtimes, 
  fetchShowtimesByMovie,
  fetchShowtimeById,
  fetchShowtimesByDate,
  fetchShowtimesByRoom
} from '../services/apiShowtimes';

const useShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm kiểm tra ngày hợp lệ
  const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // Hàm format ngày thành YYYY-MM-DD (sử dụng local time)
  const formatDateKey = (dateString) => {
    if (!isValidDate(dateString)) {
      console.warn('Invalid date string:', dateString);
      return null;
    }
    
    try {
      const date = new Date(dateString);
      // Sử dụng local time thay vì UTC để tránh lệch múi giờ
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString);
      return null;
    }
  };

  // Hàm format ngày hiển thị cho user
  const formatDisplayDate = (dateString) => {
    if (!isValidDate(dateString)) return '';
    
    try {
      const date = new Date(dateString);
      const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = dayNames[date.getDay()];
      const formattedDate = `${dayName}, ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      return formattedDate;
    } catch (error) {
      console.error('Error formatting display date:', error);
      return '';
    }
  };

  // Lấy tất cả lịch chiếu - sử dụng useCallback để tránh re-render
  const loadShowtimes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShowtimes();
      console.log('Loaded showtimes:', data);
      setShowtimes(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      setError('Không thể tải danh sách lịch chiếu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy lịch chiếu theo movie_id - sử dụng useCallback
  const loadShowtimesByMovie = useCallback(async (movieId) => {
    if (!movieId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShowtimesByMovie(movieId);
      console.log('Loaded showtimes by movie:', data);
      setShowtimes(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      setError('Không thể tải lịch chiếu của phim');
      console.error(err);
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy lịch chiếu theo ID
  const loadShowtimeById = useCallback(async (showtimeId) => {
    if (!showtimeId) return null;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShowtimeById(showtimeId);
      return data;
    } catch (err) {
      setError('Không thể tải thông tin lịch chiếu');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy lịch chiếu theo ngày
  const loadShowtimesByDate = useCallback(async (date) => {
    if (!date) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShowtimesByDate(date);
      setShowtimes(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      setError('Không thể tải lịch chiếu theo ngày');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy lịch chiếu theo phòng
  const loadShowtimesByRoom = useCallback(async (roomId) => {
    if (!roomId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShowtimesByRoom(roomId);
      setShowtimes(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      setError('Không thể tải lịch chiếu theo phòng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✨ MỚI: Lấy danh sách ngày có suất chiếu từ dữ liệu thực tế
  const getAvailableDates = useMemo(() => {
    if (!Array.isArray(showtimes) || showtimes.length === 0) {
      return [];
    }

    // Lọc ra các ngày duy nhất có suất chiếu
    const uniqueDates = new Set();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset thời gian về 00:00:00

    showtimes.forEach(showtime => {
      const dateSource = showtime.start_time || showtime.show_date;
      if (!dateSource) return;

      const showtimeDate = new Date(dateSource);
      showtimeDate.setHours(0, 0, 0, 0); // Reset thời gian về 00:00:00

      // Chỉ lấy các ngày từ hôm nay trở đi
      if (showtimeDate >= today) {
        const dateKey = formatDateKey(dateSource);
        if (dateKey) {
          uniqueDates.add(dateKey);
        }
      }
    });

    // Chuyển đổi thành array và sắp xếp theo thứ tự thời gian
    const sortedDates = Array.from(uniqueDates)
      .sort()
      .map(dateKey => ({
        value: dateKey,
        label: formatDisplayDate(dateKey),
        date: new Date(dateKey)
      }));

    console.log('Available dates for movie:', sortedDates);
    return sortedDates;
  }, [showtimes]);

  // ✨ MỚI: Lấy danh sách thời gian có sẵn cho ngày cụ thể
  const getAvailableTimesForDate = useCallback((targetDate) => {
    if (!targetDate || !Array.isArray(showtimes) || showtimes.length === 0) {
      return [];
    }

    const times = showtimes
      .filter(showtime => {
        const showtimeDate = formatDateKey(showtime.start_time || showtime.show_date);
        return showtimeDate === targetDate;
      })
      .map(showtime => {
        const startTime = new Date(showtime.start_time);
        const timeString = startTime.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        return {
          time: timeString,
          showtime: showtime // Giữ lại thông tin showtime đầy đủ
        };
      })
      .filter((item, index, arr) => 
        // Remove duplicates based on time
        arr.findIndex(t => t.time === item.time) === index
      )
      .sort((a, b) => a.time.localeCompare(b.time));

    console.log('Available times for date', targetDate, ':', times);
    return times;
  }, [showtimes]);

  // Lọc lịch chiếu theo ngày (client-side)
  const filterShowtimesByDate = useCallback((targetDate) => {
    return showtimes.filter(showtime => {
      const showtimeDate = formatDateKey(showtime.start_time || showtime.show_date);
      const filterDate = formatDateKey(targetDate);
      return showtimeDate === filterDate;
    });
  }, [showtimes]);

  // Lọc lịch chiếu theo thời gian (client-side)
  const filterShowtimesByTime = useCallback((startTime, endTime) => {
    return showtimes.filter(showtime => {
      const showtimeTime = showtime.start_time || showtime.show_time;
      return showtimeTime >= startTime && showtimeTime <= endTime;
    });
  }, [showtimes]);

  // Nhóm lịch chiếu theo phim
  const groupShowtimesByMovie = useCallback(() => {
    if (!Array.isArray(showtimes)) return {};
    
    return showtimes.reduce((acc, showtime) => {
      const movieId = showtime.movie?.id;
      if (!movieId) return acc;
      
      if (!acc[movieId]) {
        acc[movieId] = {
          movie: showtime.movie,
          showtimes: []
        };
      }
      acc[movieId].showtimes.push(showtime);
      return acc;
    }, {});
  }, [showtimes]);

  // Nhóm lịch chiếu theo ngày
  const groupShowtimesByDate = useCallback(() => {
    if (!Array.isArray(showtimes) || showtimes.length === 0) {
      console.log('No showtimes to group');
      return {};
    }

    return showtimes.reduce((groups, showtime) => {
      // Kiểm tra showtime có hợp lệ không
      if (!showtime || (!showtime.start_time && !showtime.show_date)) {
        console.warn('Invalid showtime object:', showtime);
        return groups;
      }

      // Sử dụng start_time hoặc show_date
      const dateSource = showtime.start_time || showtime.show_date;
      const dateKey = formatDateKey(dateSource);
      
      if (!dateKey) {
        console.warn('Could not format date for showtime:', showtime);
        return groups;
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(showtime);
      return groups;
    }, {});
  }, [showtimes]);

  // ✨ MỚI: Tìm showtime cụ thể theo ngày và giờ
  const findShowtimeByDateTime = useCallback((targetDate, targetTime) => {
    return showtimes.find(showtime => {
      const showtimeDate = formatDateKey(showtime.start_time || showtime.show_date);
      const showtimeTime = new Date(showtime.start_time).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      return showtimeDate === targetDate && showtimeTime === targetTime;
    });
  }, [showtimes]);

  return {
    showtimes,
    loading,
    error,
    
    // Load functions
    loadShowtimes,
    loadShowtimesByMovie,
    loadShowtimeById,
    loadShowtimesByDate,
    loadShowtimesByRoom,
    
    // Filter functions
    filterShowtimesByDate,
    filterShowtimesByTime,
    
    // Group functions
    groupShowtimesByMovie,
    groupShowtimesByDate,
    
    // ✨ New enhanced functions
    getAvailableDates,           // Lấy danh sách ngày có suất chiếu thực tế
    getAvailableTimesForDate,    // Lấy danh sách giờ chiếu cho ngày cụ thể
    findShowtimeByDateTime,      // Tìm showtime cụ thể
    
    // Utility functions
    setShowtimes,
    setError,
    formatDateKey,
    formatDisplayDate
  };
};

export default useShowtimes;