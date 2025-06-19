import React, { useState } from "react";
import { loginUser } from "../../services/authService";

export default function LoginModal({ isOpen, onClose, onSwitchToRegister, refreshUser }) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Reset error
    setError("");
    
    // Validation
    if (!loginData.email || !loginData.password) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginData.email)) {
      setError("Email không hợp lệ!");
      return;
    }

    setLoginLoading(true);
    
    try {
      console.log('Bắt đầu đăng nhập với email:', loginData.email);
      
      const result = await loginUser(loginData.email, loginData.password);
      
      console.log('Kết quả đăng nhập:', result);
      
      // Refresh user data nếu có hàm refreshUser
      if (refreshUser) {
        try {
          await refreshUser();
        } catch (refreshError) {
          console.warn('Không thể refresh user data:', refreshError);
          // Không throw lỗi vì đăng nhập đã thành công
        }
      }
      
      // Đóng modal và reset form
      onClose();
      setLoginData({ email: "", password: "" });
      setError("");
      
      // Hiển thị thông báo thành công
      alert("Đăng nhập thành công!");
      
      // Refresh trang để cập nhật UI
      window.location.reload();
      
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      
      // Hiển thị lỗi chi tiết
      if (error.message) {
        setError(error.message);
      } else {
        setError("Đăng nhập thất bại! Vui lòng thử lại.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setLoginData({ email: "", password: "" });
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loginLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hiển thị lỗi */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email *
            </label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
              placeholder="Nhập email của bạn"
              disabled={loginLoading}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Mật khẩu *
            </label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
              placeholder="Nhập mật khẩu"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
              disabled={loginLoading}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  Đang đăng nhập...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </div>

          <p className="text-center text-gray-600 text-sm mt-4">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-yellow-600 hover:text-yellow-800 font-medium"
              disabled={loginLoading}
            >
              Đăng ký ngay
            </button>
          </p>
        </form>

     
      </div>
    </div>
  );
}