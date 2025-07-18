import apiAdmin from './apiAdmin';

// Lấy danh sách quà tặng
export const fetchGifts = async () => {
  const res = await apiAdmin.get('/gifts');
  return res.data;
};

// Không tạo FormData lại
export const addGift = async (formData) => {
  const res = await apiAdmin.post('/gifts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const updateGift = async (id, formData) => {
  
  const res = await apiAdmin.post(`/gifts/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};


// Xóa quà tặng
export const deleteGift = async (id) => {
  const res = await apiAdmin.delete(`/gifts/${id}`);
  return res.data.message || 'Xóa quà tặng thành công';
};