// authService.js
import api from './api';

export const AUTH_EVENTS = {
  LOGIN_STATUS_CHANGE: 'loginStatusChange'
};

// Hàm helper để lưu auth data
const saveAuthData = (token, user) => {
  if (token) {
    localStorage.setItem('token', token);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  // Kích hoạt sự kiện thay đổi auth
  window.dispatchEvent(new Event(AUTH_EVENTS.LOGIN_STATUS_CHANGE));
};

// Hàm helper để clear auth data
const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Kích hoạt sự kiện thay đổi auth
  window.dispatchEvent(new Event(AUTH_EVENTS.LOGIN_STATUS_CHANGE));
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    
    console.log('Login response:', response.data); // Debug log
    
    // ✅ SỬA: Đọc đúng structure từ backend
    const { access_token, customer, message } = response.data;
    
    if (access_token && customer) {
      saveAuthData(access_token, customer);
      return response.data;
    } else {
      throw new Error('Không nhận được token hoặc thông tin user từ server');
    }
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    
    // ✅ SỬA: Xử lý lỗi từ backend tốt hơn
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.email) {
      throw new Error(error.response.data.email[0]);
    } else {
      throw new Error('Đăng nhập thất bại! Vui lòng thử lại.');
    }
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    
    console.log('Register response:', response.data); // Debug log
    
    // ✅ SỬA: Đọc đúng structure từ backend
    const { access_token, message } = response.data;
    
    if (access_token) {
      // Không có customer info trong register response, chỉ lưu token
      
      return response.data;
    } else {
      console.warn('Đăng ký thành công nhưng không có token');
      return response.data;
    }
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    
    // ✅ SỬA: Xử lý lỗi validation từ backend
    if (error.response?.data) {
      const errors = error.response.data;
      const firstError = Object.values(errors)[0];
      if (Array.isArray(firstError)) {
        throw new Error(firstError[0]);
      } else {
        throw new Error(firstError || 'Đăng ký thất bại');
      }
    }
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Không có token');
    }
    
    const response = await api.get('/user');
    
    // ✅ SỬA: Backend trả về user data trực tiếp
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Lỗi lấy thông tin user:', error);
    
    // Nếu token không hợp lệ, clear auth data
    if (error.response?.status === 401) {
      clearAuthData();
    }
    
    throw error;
  }
};

export const getUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // Kiểm tra cả user và token
    if (storedUser && storedUser !== 'undefined' && token) {
      return JSON.parse(storedUser);
    }
  } catch (e) {
    console.error('Lỗi đọc user từ localStorage:', e);
    // Clear corrupted data
    clearAuthData();
  }
  return null;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
};

export const logoutUser = () => {
  clearAuthData();
  
  // Redirect về trang chủ (tùy chọn)
  // window.location.href = '/';
};

// ✅ THÊM: Hàm refresh user data
export const refreshUserData = async () => {
  try {
    const userData = await getCurrentUser();
    return userData;
  } catch (error) {
    console.error('Không thể refresh user data:', error);
    throw error;
  }
};

// Hàm để check và refresh token nếu cần
export const checkAuthStatus = async () => {
  try {
    if (isAuthenticated()) {
      // Thử gọi API để verify token
      await getCurrentUser();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};