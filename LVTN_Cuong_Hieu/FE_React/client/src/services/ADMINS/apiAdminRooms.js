import apiAdmin from './apiAdmin';

export const fetchRoom = async () => {
  const res = await apiAdmin.get('/rooms');
  return res.data;
};

// Cập nhật phòng - sửa từ POST thành PUT
export const updateRoom = async (id, roomData) => {
  const res = await apiAdmin.post(`/rooms/${id}`, roomData);
  return res.data;
};

// Đếm tổng số phòng
export const countRoom = async () => {
  const res = await apiAdmin.get('/rooms/count');
  return res.data.total_rooms || 0;
};

// Tìm kiếm phòng - sửa parameter từ keyword thành name
export const searchRoom = async (name) => {
  const res = await apiAdmin.get(`/rooms/search?name=${encodeURIComponent(name)}`);
  return res.data;
};

// Thống kê phòng theo trạng thái
export const getRoomStatistics = async () => {
  const res = await apiAdmin.get('/rooms/statistics');
  return res.data;
};