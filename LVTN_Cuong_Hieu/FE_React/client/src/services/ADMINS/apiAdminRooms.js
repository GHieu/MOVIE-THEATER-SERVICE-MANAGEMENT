import apiAdmin from './apiAdmin';

export const fetchRoom = async () => {
  const res = await apiAdmin.get('/rooms');
  return res.data; // đúng theo cấu trúc bạn gửi
};

// Cập nhật phòng
export const updateRoom = async (id, roomData) => {
  const res = await apiAdmin.put(`/rooms/${id}`, roomData); // gửi JSON
  return res.data; // trả về object room đã cập nhật
};

// Đếm tổng số 
export const countRoom = async () => {
  const res = await apiAdmin.get('/rooms/count');
  return res.data.total_movies || 0;
};

// Tìm kiếm 
export const searchRoom = async (keyword) => {
  const res = await apiAdmin.get(`/rooms/search?keyword=${encodeURIComponent(keyword)}`);
  return res.data;
};







