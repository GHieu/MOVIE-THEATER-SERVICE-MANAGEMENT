// src/api/adminApi.js
import apiAdmin from './apiAdmin';

export const loginAdmin = async (email, password) => {
  return apiAdmin.post('/login', { email, password })
    .then(response => response.data);
};

export const userAdmin = async () => {
  try {
    const response = await apiAdmin.get('/user');
    return response.data.admin; // vì Laravel trả về { admin: {...} }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin admin:', error);
    throw error;
  }
};
