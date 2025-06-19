import apiAdmin from './apiAdmin';

// Lấy danh sách suất chiếu với phân trang
export const getShowtimes = async (page = 1, perPage = 10, keyword = '') => {
  let url = `/showtimes?page=${page}&per_page=${perPage}`;
  if (keyword) {
    url += `&keyword=${encodeURIComponent(keyword)}`;
  }
  
  const res = await apiAdmin.get(url);
  return res.data;
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

// Cập nhật suất chiếu (⚠️ dùng POST thay vì PUT do backend định nghĩa)
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
  const res = await apiAdmin.get('/showtimes/statistic/count');
  return res.data;
};