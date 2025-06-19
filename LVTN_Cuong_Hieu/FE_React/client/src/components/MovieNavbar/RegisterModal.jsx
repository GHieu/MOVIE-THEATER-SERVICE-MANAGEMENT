import React, { useState } from "react";
import { registerUser } from "../../services/authService";

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const [registerData, setRegisterData] = useState({ 
    name: "", 
    birthdate: "",
    gender: "",
    phone: "",
    address: "",
    email: "", 
    password: "", 
    password_confirmation: "" 
  });
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!registerData.name || !registerData.birthdate || !registerData.gender || 
        !registerData.phone || !registerData.address || !registerData.email || 
        !registerData.password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (registerData.password !== registerData.password_confirmation) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    setRegisterLoading(true);
    try {
      await registerUser({
        name: registerData.name,
        birthdate: registerData.birthdate,
        gender: registerData.gender,
        phone: registerData.phone,
        address: registerData.address,
        email: registerData.email,
        password: registerData.password,
        password_confirmation: registerData.password_confirmation
      });
      onClose();
      setRegisterData({ 
        name: "", 
        birthdate: "",
        gender: "",
        phone: "",
        address: "",
        email: "", 
        password: "", 
        password_confirmation: "" 
      });
      alert("Đăng ký thành công!");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      alert(error.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setRegisterData({ 
      name: "", 
      birthdate: "",
      gender: "",
      phone: "",
      address: "",
      email: "", 
      password: "", 
      password_confirmation: "" 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Đăng ký</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={registerLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Họ tên *
            </label>
            <input
              type="text"
              value={registerData.name}
              onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
              placeholder="Nhập họ tên của bạn"
              disabled={registerLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Ngày sinh *
            </label>
            <input
              type="date"
              value={registerData.birthdate}
              onChange={(e) => setRegisterData({...registerData, birthdate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
              disabled={registerLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Giới tính *
            </label>
            <select
              value={registerData.gender}
              onChange={(e) => setRegisterData({...registerData, gender: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
              disabled={registerLoading}
              required
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Số điện thoại *
            </label>
            <input
              type="tel"
              value={registerData.phone}
              onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
              placeholder="Nhập số điện thoại"
              disabled={registerLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Địa chỉ *
            </label>
            <textarea
              value={registerData.address}
              onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 resize-none"
              placeholder="Nhập địa chỉ của bạn"
              rows="2"
              disabled={registerLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email *
            </label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
              placeholder="Nhập email của bạn"
              disabled={registerLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Mật khẩu *
            </label>
            <input
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
              placeholder="Nhập mật khẩu"
              disabled={registerLoading}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Xác nhận mật khẩu *
            </label>
            <input
              type="password"
              value={registerData.password_confirmation}
              onChange={(e) => setRegisterData({...registerData, password_confirmation: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
              placeholder="Nhập lại mật khẩu"
              disabled={registerLoading}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={registerLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  Đang đăng ký...
                </div>
              ) : (
                "Đăng ký"
              )}
            </button>
          </div>

          <p className="text-center text-gray-600 text-sm mt-4">
            Đã có tài khoản?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-yellow-600 hover:text-yellow-800 font-medium"
              disabled={registerLoading}
            >
              Đăng nhập ngay
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}