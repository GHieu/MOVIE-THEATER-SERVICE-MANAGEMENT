import apiAdmin from './apiAdmin';

// Lấy danh sách phim với phân trang và tìm kiếm
export const fetchMovies = async (page = 1, search = '', perPage = 10) => {
  const params = {
    page,
    per_page: perPage
  };
  
  // Thêm search param nếu có
  if (search && search.trim()) {
    params.search = search.trim();
  }

  const res = await apiAdmin.get('/movies', { params });
  return res.data.movies; // Trả về object pagination đầy đủ
};

// Thêm phim
export const addMovie = async (formData) => {
  const res = await apiAdmin.post('/movies', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
    },
  });
  return res.data;
};

// Cập nhật phim
export const updateMovie = async (id, formData) => {
  const res = await apiAdmin.post(`/movies/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
    },
  });
  return res.data;
};

// Xóa phim
export const deleteMovie = async (id) => {
  const res = await apiAdmin.delete(`/movies/${id}`);
  return res.data.message || 'Xóa thành công';
};