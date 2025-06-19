import api from './api'; // hoặc axios instance của bạn

// Lấy tất cả lịch chiếu
export const fetchShowtimes = async () => {
  try {
    const response = await api.get('/showtimes');
    return response.data;
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    throw error;
  }
};

// Lấy lịch chiếu theo movie_id
export const fetchShowtimesByMovie = async (movieId) => {
  try {
    const response = await api.get(`/movies/${movieId}/showtimes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtimes for movie ${movieId}:`, error);
    throw error;
  }
};

// Nếu bạn cần thêm các API khác cho showtime
export const fetchShowtimeById = async (showtimeId) => {
  try {
    const response = await api.get(`/showtimes/${showtimeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtime ${showtimeId}:`, error);
    throw error;
  }
};

// Lấy lịch chiếu theo ngày
export const fetchShowtimesByDate = async (date) => {
  try {
    const response = await api.get(`/showtimes?date=${date}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtimes for date ${date}:`, error);
    throw error;
  }
};

// Lấy lịch chiếu theo phòng chiếu
export const fetchShowtimesByRoom = async (roomId) => {
  try {
    const response = await api.get(`/showtimes?room_id=${roomId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtimes for room ${roomId}:`, error);
    throw error;
  }
};