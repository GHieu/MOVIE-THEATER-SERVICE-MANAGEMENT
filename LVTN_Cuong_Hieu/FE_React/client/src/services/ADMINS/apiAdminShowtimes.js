// apiAdminShowtimes.js - Cập nhật theo BE Laravel
import apiAdmin from './apiAdmin';

// Lấy danh sách suất chiếu với phân trang và filter
export const getShowtimes = async (page = 1, perPage = 10, keyword = '', roomId = null, date = null, status = null, movieId = null, promotionId = null, sortBy = 'start_time', sortDir = 'asc') => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  // Thêm các filter parameters
  if (keyword && keyword.trim()) {
    params.append('keyword', keyword.trim());
  }
  
  if (roomId) {
    params.append('room_id', roomId.toString());
  }
  
  if (date) {
    params.append('date', date);
  }
  
  if (status) {
    params.append('status', status);
  }
  
  if (movieId) {
    params.append('movie_id', movieId.toString());
  }
  
  if (promotionId) {
    params.append('promotion_id', promotionId.toString());
  }
  
  if (sortBy) {
    params.append('sort_by', sortBy);
  }
  
  if (sortDir) {
    params.append('sort_dir', sortDir);
  }
  
  const res = await apiAdmin.get(`/showtimes?${params.toString()}`);

  return res.data;
};

// Wrapper cho backward compatibility với useAdminSeats hook
export const getShowtimesWithKeyword = async (page = 1, perPage = 10, keyword = '') => {
  return getShowtimes(page, perPage, keyword);
};

// Lấy suất chiếu theo filter object (cho flexibility)
export const getShowtimesWithFilters = async (page = 1, perPage = 10, filters = {}) => {
  const {
    keyword = '',
    room_id = null,
    date = null,
    status = null,
    movie_id = null,
    promotion_id = null,
    sort_by = 'start_time',
    sort_dir = 'asc'
  } = filters;

  return getShowtimes(page, perPage, keyword, room_id, date, status, movie_id, promotion_id, sort_by, sort_dir);
};

// Thêm suất chiếu mới
export const addShowtime = async (data) => {
  const res = await apiAdmin.post('/showtimes', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

// Cập nhật suất chiếu
export const updateShowtime = async (id, data) => {
  const res = await apiAdmin.post(`/showtimes/${id}`, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return res.data;
};

// Xoá suất chiếu
export const deleteShowtime = async (id) => {
  const res = await apiAdmin.delete(`/showtimes/${id}`);
  return res.data;
};

// Lấy chi tiết suất chiếu
export const getShowtimeById = async (id) => {
  const res = await apiAdmin.get(`/showtimes/${id}`);
  return res.data;
};

// Thống kê tổng số suất chiếu
export const countShowtimes = async () => {
  try {
    const res = await apiAdmin.get('/showtimes/count');
    return res.data;
  } catch (error) {
    console.warn('Count API not available, using fallback');
    // Fallback: Lấy từ API chính với page=1, per_page=1 để lấy total count
    const res = await apiAdmin.get('/showtimes?page=1&per_page=1');
    return {
      total_showtimes: res.data?.data?.total || 0,
      today_showtimes: res.data?.summary?.today || 0,
      upcoming_showtimes: res.data?.summary?.upcoming || 0,
      ongoing_showtimes: res.data?.summary?.ongoing || 0,
      finished_showtimes: res.data?.summary?.finished || 0
    };
  }
};

// ✅ FIX: Lấy suất chiếu theo phòng và ngày (cho useAdminSeats hook)
export const getShowtimesByRoomAndDate = async (roomId, date) => {
  // Truyền đúng thứ tự tham số: page, perPage, keyword, roomId, date
  return getShowtimes(1, 100, '', roomId, date);
};

// ✅ FIX: Lấy suất chiếu hôm nay theo phòng
export const getTodayShowtimesByRoom = async (roomId) => {
  const today = new Date().toISOString().split('T')[0];
  // Truyền đúng thứ tự tham số: page, perPage, keyword, roomId, date
  return getShowtimes(1, 100, '', roomId, today);
};

// Lấy suất chiếu theo trạng thái
export const getShowtimesByStatus = async (status, page = 1, perPage = 10) => {
  // Truyền đúng thứ tự tham số: page, perPage, keyword, roomId, date, status
  return getShowtimes(page, perPage, '', null, null, status);
};

// Lấy suất chiếu theo phim
export const getShowtimesByMovie = async (movieId, page = 1, perPage = 10) => {
  // Truyền đúng thứ tự tham số: page, perPage, keyword, roomId, date, status, movieId
  return getShowtimes(page, perPage, '', null, null, null, movieId);
};

// Lấy suất chiếu theo khuyến mãi
export const getShowtimesByPromotion = async (promotionId, page = 1, perPage = 10) => {
  // Truyền đúng thứ tự tham số: page, perPage, keyword, roomId, date, status, movieId, promotionId
  return getShowtimes(page, perPage, '', null, null, null, null, promotionId);
};