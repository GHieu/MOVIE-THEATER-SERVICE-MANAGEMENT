import apiAdmin from './apiAdmin';

// Lấy danh sách phim (có phân trang)
export const fetchMovies = async () => {
  const res = await apiAdmin.get('/movies');
  return res.data.movies.data; // Lấy mảng phim từ trong object movies
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
  const res = await apiAdmin.post(`/movies/${id}?_method=PUT`, formData, {
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
  return res.data.message || 'Xóa thành công'; // backend nên trả về message
};

// Đếm tổng số phim (tuỳ backend hỗ trợ)
export const countMovies = async () => {
  const res = await apiAdmin.get('/movies/count');
  return res.data.total_movies || 0;
};
