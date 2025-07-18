// services/apiMemberships.js
import api from './api'; // Axios instance

// Đăng ký thẻ thành viên
export const addMemberships = async (data) => {
  try {
    const response = await api.post('/membership/register', data);
    return response.data;
  } catch (error) {
    console.error('Error registering membership:', error);
    throw error;
  }
};

// Lấy thông tin thẻ thành viên của customer hiện tại
export const getMembershipProfile = async () => {
  try {
    const response = await api.get('/membership/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching membership profile:', error);
    throw error;
  }
};

