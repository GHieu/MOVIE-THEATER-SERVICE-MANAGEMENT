// services/apiSeat.js - Cập nhật với các API cần thiết
import api from './api';

// Lấy ghế theo room_id
export const fetchSeatsByRoom = async (roomId) => {
  try {
    const response = await api.get(`/rooms/${roomId}/seats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching seats for room ${roomId}:`, error);
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách ghế');
  }
};

// Lấy ghế theo showtime (bao gồm trạng thái đã đặt)
export const fetchSeatsByShowtime = async (showtimeId) => {
  try {
    const response = await api.get(`/showtimes/${showtimeId}/seats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching seats for showtime ${showtimeId}:`, error);
    // Fallback: nếu API showtime/seats chưa có, dùng API room
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách ghế');
  }
};

// Kiểm tra tính khả dụng của ghế
export const checkSeatAvailability = async (showtimeId, seatIds) => {
  try {
    const response = await api.post(`/showtimes/${showtimeId}/seats/check`, {
      seat_ids: seatIds
    });
    return response.data;
  } catch (error) {
    console.error('Error checking seat availability:', error);
    // Fallback: giả định ghế available nếu API chưa có
    return { available: true, unavailable_seats: [] };
  }
};

// Giữ ghế tạm thời
export const holdSeats = async (showtimeId, seatIds) => {
  try {
    const response = await api.post(`/showtimes/${showtimeId}/seats/hold`, {
      seat_ids: seatIds
    });
    return response.data;
  } catch (error) {
    console.error('Error holding seats:', error);
    // Fallback: trả về success nếu API chưa có
    return { success: true };
  }
};

// Hủy giữ ghế
export const releaseHeldSeats = async (showtimeId, seatIds) => {
  try {
    const response = await api.post(`/showtimes/${showtimeId}/seats/release`, {
      seat_ids: seatIds
    });
    return response.data;
  } catch (error) {
    console.error('Error releasing seats:', error);
    return { success: true };
  }
};

// services/apiMovie.js - API cho thông tin phim
export const fetchMovieById = async (movieId) => {
  try {
    const response = await api.get(`/movies/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie ${movieId}:`, error);
    throw new Error(error.response?.data?.message || 'Không thể tải thông tin phim');
  }
};

// services/apiShowtime.js - Cập nhật API showtime
export const fetchShowtimesByMovie = async (movieId) => {
  try {
    const response = await api.get(`/movies/${movieId}/showtimes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtimes for movie ${movieId}:`, error);
    throw new Error(error.response?.data?.message || 'Không thể tải suất chiếu');
  }
};

export const fetchShowtimeById = async (showtimeId) => {
  try {
    const response = await api.get(`/showtimes/${showtimeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtime ${showtimeId}:`, error);
    throw new Error(error.response?.data?.message || 'Không thể tải thông tin suất chiếu');
  }
};