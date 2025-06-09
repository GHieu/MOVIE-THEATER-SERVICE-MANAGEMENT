import api from './api'; // Đây là axios instance đã cấu hình baseURL

export const AUTH_EVENTS = {
  LOGIN_STATUS_CHANGE: 'loginStatusChange'
};
export const loginUser = async (email, password) => {
  const response = await api.post('/login', { email, password });
  if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Kích hoạt sự kiện login
      window.dispatchEvent(new Event(AUTH_EVENTS.LOGIN_STATUS_CHANGE));
    }
  return response.data;
};


export const registerUser = async (data) => {
  const response = await api.post('/register', data);

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/user'); // route này yêu cầu token và trả về thông tin người dùng
  return response.data;
};


