import apiAdmin from './apiAdmin';

// Lấy danh sách lịch sử đổi quà với các tham số lọc
export const getGiftHistory = async (params = {}) => {
  const res = await apiAdmin.get('/gift-history', { params });
  return res.data;
};

// Lấy lịch sử với các bộ lọc chi tiết
export const getGiftHistoryWithFilters = async (filters = {}) => {
  const {
    customer,
    gift,
    from_date,
    to_date,
    page = 1
  } = filters;

  const params = {};
  
  if (customer) params.customer = customer;
  if (gift) params.gift = gift;
  if (from_date) params.from_date = from_date;
  if (to_date) params.to_date = to_date;
  if (page) params.page = page;

  const res = await apiAdmin.get('/gift-history', { params });
  return res.data;
};

// Tìm kiếm theo tên khách hàng
export const searchGiftHistoryByCustomer = async (customerName, page = 1) => {
  const params = {
    customer: customerName,
    page
  };
  
  const res = await apiAdmin.get('/gift-history', { params });
  return res.data;
};

// Tìm kiếm theo tên quà
export const searchGiftHistoryByGift = async (giftName, page = 1) => {
  const params = {
    gift: giftName,
    page
  };
  
  const res = await apiAdmin.get('/gift-history', { params });
  return res.data;
};

// Lọc theo khoảng thời gian
export const getGiftHistoryByDateRange = async (fromDate, toDate, page = 1) => {
  const params = {
    from_date: fromDate,
    to_date: toDate,
    page
  };
  
  const res = await apiAdmin.get('/gift-history', { params });
  return res.data;
};