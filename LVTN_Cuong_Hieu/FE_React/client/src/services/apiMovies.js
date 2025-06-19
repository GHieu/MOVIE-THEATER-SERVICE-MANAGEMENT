import api from './api';

// Lấy danh sách phim đang chiếu
export const fetchNowShowingMovies = async () => {
  const response = await api.get('/movies?type=now_showing');
  return response.data;
};

// Lấy danh sách phim sắp chiếu
export const fetchComingSoonMovies = async () => {
  const response = await api.get('/movies?type=coming_soon');
  return response.data;
};

// Lấy tất cả phim (nếu cần dùng trang danh sách đầy đủ hoặc không lọc)
export const fetchAllMovies = async () => {
  const response = await api.get('/movies');
  return response.data;
};

// Lấy chi tiết phim theo ID
export const fetchMovieById = async (id) => {
  const response = await api.get(`/movies/${id}`);
  return response.data;
};

// Tìm kiếm phim theo tên
export const searchMovies = async (query, filters = {}) => {
  const params = new URLSearchParams();
  
  if (query) {
    params.append('search', query);
  }
  
  // Thêm các filter khác nếu có
  if (filters.type) {
    params.append('type', filters.type);
  }
  
  if (filters.status) {
    params.append('status', filters.status);
  }
  
  const response = await api.get(`/movies?${params.toString()}`);
  return response.data;
};

// Lấy phim với filters và pagination
export const fetchMoviesWithFilters = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  });
  
  const response = await api.get(`/movies?${params.toString()}`);
  return response.data;
};