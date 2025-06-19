import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../services/ADMINS/authAdminServices';

const LoginAdmin = ({ onLogin }) => {  // Nhận props onLogin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await loginAdmin(email, password);
      console.log('Login response data:', data);
      
      const token = data.token || data.access_token;
      if (!token) {
        setError('Không nhận được token từ server');
        return;
      }
      
      // Lưu token và trạng thái
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminLoggedIn', 'true');
      
      // Gọi callback để cập nhật state ở App component
      if (onLogin) {
        onLogin();
      }
      
      // Navigate tới đúng route
      navigate('/admin', { replace: true });
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập Admin</h2>

        {error && (
          <div className="text-red-500 mb-4 text-sm bg-red-50 p-3 rounded border">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:border-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-semibold">Mật khẩu</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};

export default LoginAdmin;