import apiAdmin from './apiAdmin';

// Lấy danh sách ghế theo room_id
export const getSeatsByRoom = async (roomId) => {
  const res = await apiAdmin.get(`/seats/room/${roomId}`);
  return res.data;
};

// Cập nhật 1 ghế
export const updateSeat = async (id, data) => {
  const res = await apiAdmin.post(`/seats/${id}`, data);
  return res.data;
};

// Thống kê số lượng ghế theo loại (standard, vip, couple)
export const fetchSeatTypeCount = async (roomId) => {
  const res = await apiAdmin.get(`/seats/count/${roomId}`);
  return res.data;
};

// Tự động gán loại ghế, giá và trạng thái theo dãy ghế
export const autoSetSeatType = async (roomId) => {
  const res = await apiAdmin.post(`/seats/settype/${roomId}`);
  return res.data;
};

// Lấy danh sách suất chiếu theo phòng (API mới)
export const getShowtimesByRoom = async (roomId) => {
  const res = await apiAdmin.get(`/rooms/${roomId}/showtimes`);
  return res.data;
};

// Lấy trạng thái ghế theo suất chiếu (API mới)
export const getSeatsByShowtime = async (showtimeId) => {
  const res = await apiAdmin.get(`/showtimes/${showtimeId}/seats`);
  return res.data;
};