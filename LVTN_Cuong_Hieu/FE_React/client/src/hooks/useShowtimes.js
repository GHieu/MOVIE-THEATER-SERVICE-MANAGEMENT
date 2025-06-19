import { useState, useEffect, useCallback } from 'react';
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

  // Nhóm lịch chiếu theo ngày - FIXED
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

  // REMOVED: Auto load effect - không cần thiết và gây lặp vô hạn
  // useEffect(() => {
  //   if (!showtimes.length) {
  //     loadShowtimes();
  //   }
  // }, []);

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
    
    // Utility functions
    setShowtimes,
    setError
  };
};

export default useShowtimes;