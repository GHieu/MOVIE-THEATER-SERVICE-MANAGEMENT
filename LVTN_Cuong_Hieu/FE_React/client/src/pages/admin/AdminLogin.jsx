import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../services/ADMINS/authAdminServices';

const LoginAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const data = await loginAdmin(email, password);
    console.log('Login response data:', data);  // Xem backend trả về gì
    const token = data.token || data.access_token; // thử lấy cả token hoặc access_token
    if (!token) {
      setError('Không nhận được token từ server');
      return;
    }
    localStorage.setItem('adminToken', token);
    navigate('/admin/dashboard');
  } catch (error) {
    setError(error.response?.data?.message || 'Đăng nhập thất bại');
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập Admin</h2>

        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-semibold">Mật khẩu</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
};

export default LoginAdmin;
