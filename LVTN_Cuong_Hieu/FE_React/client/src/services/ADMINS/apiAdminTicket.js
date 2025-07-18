import apiAdmin from './apiAdmin';

// Lấy tất cả vé với phân trang
export const fetchTicketsHistory = async (page = 1) => {
  const params = {
    page
  };

  const res = await apiAdmin.get('/tickets/history', { params });
  return res.data; // Trả về object pagination đầy đủ
};

// Lọc vé theo thời gian
export const filterTickets = async (fromDate = null, toDate = null) => {
  const params = {};
  
  // Thêm from_date param nếu có
  if (fromDate) {
    params.from_date = fromDate;
  }
  
  // Thêm to_date param nếu có
  if (toDate) {
    params.to_date = toDate;
  }

  const res = await apiAdmin.get('/tickets/filter', { params });
  return res.data; // Trả về danh sách vé đã lọc
};