import api from './api';

// Lấy danh sách quà tặng
export const getGifts = async () => {
  const res = await api.get('/gifts');
  return res.data;
};

// Đổi quà tặng
export const exchangeGift = async (giftId) => {
  const res = await api.post('/gifts', {
    gift_id: giftId
  }
    );
  return res.data;
};
export const getGiftHistory = async () => {
  const res = await api.get('/gifthistory');
  return res.data;
};