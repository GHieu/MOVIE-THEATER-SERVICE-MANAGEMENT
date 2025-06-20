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
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return "Họ tên là bắt buộc";
    if (name.length > 50) return "Họ tên không được vượt quá 50 ký tự";
    if (!/^[\p{L}\s]+$/u.test(name)) return "Họ tên chỉ được chứa chữ cái và khoảng trắng";
    return "";
  };

  const validateBirthdate = (birthdate) => {
    if (!birthdate) return "Ngày sinh là bắt buộc";
    const today = new Date();
    const birth = new Date(birthdate);
    if (birth >= today) return "Ngày sinh phải trước ngày hôm nay";
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone) return "Số điện thoại là bắt buộc";
    if (!/^0[0-9]{9}$/.test(phone)) return "Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số";
    return "";
  };

  const validateAddress = (address) => {
    if (!address.trim()) return "Địa chỉ là bắt buộc";
    if (address.length > 100) return "Địa chỉ không được vượt quá 100 ký tự";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email là bắt buộc";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Email không hợp lệ";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Mật khẩu là bắt buộc";
    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    if (!/^(?=.*[A-Z])(?=.*\d).+$/.test(password)) return "Mật khẩu phải có ít nhất 1 chữ hoa và 1 chữ số";
    return "";
  };

  const validatePasswordConfirmation = (password, confirmation) => {
    if (!confirmation) return "Xác nhận mật khẩu là bắt buộc";
    if (password !== confirmation) return "Mật khẩu xác nhận không khớp";
    return "";
  };

  const handleInputChange = (field, value) => {
    setRegisterData({...registerData, [field]: value});
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({...errors, [field]: ""});
    }
    
    // Clear general error when user starts typing
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      name: validateName(registerData.name),
      birthdate: validateBirthdate(registerData.birthdate),
      gender: !registerData.gender ? "Giới tính là bắt buộc" : "",
      phone: validatePhone(registerData.phone),
      address: validateAddress(registerData.address),
      email: validateEmail(registerData.email),
      password: validatePassword(registerData.password),
      password_confirmation: validatePasswordConfirmation(registerData.password, registerData.password_confirmation)
    };

    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);

    // If there are validation errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setRegisterLoading(true);
    setGeneralError(""); // Clear previous general error
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
      setErrors({});
      setGeneralError("");
      alert("Đăng ký thành công!");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      
      // Handle backend validation errors
      if (error.response?.status === 422 && error.response?.data) {
        setErrors(error.response.data);
        setGeneralError("Vui lòng kiểm tra lại thông tin đã nhập!");
      } else if (error.response?.status === 409) {
        // Conflict - duplicate data
        setGeneralError("Email hoặc số điện thoại đã được sử dụng!");
      } else if (error.response?.status === 500) {
        // Server error
        setGeneralError("Lỗi server! Vui lòng thử lại sau.");
      } else if (error.response?.data?.message) {
        // Other error messages from backend
        setGeneralError(error.response.data.message);
      } else if (error.message === 'Network Error') {
        setGeneralError("Lỗi kết nối mạng! Vui lòng kiểm tra internet.");
      } else {
        setGeneralError("Đăng ký thất bại! Vui lòng thử lại.");
      }
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
    setErrors({});
    setGeneralError("");
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

        {/* General Error Message */}
        {generalError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{generalError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Họ tên *
            </label>
            <input
              type="text"
              value={registerData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập họ tên của bạn"
              disabled={registerLoading}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.name) ? errors.name[0] : errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Ngày sinh *
            </label>
            <input
              type="date"
              value={registerData.birthdate}
              onChange={(e) => handleInputChange('birthdate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 ${
                errors.birthdate ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={registerLoading}
            />
            {errors.birthdate && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.birthdate) ? errors.birthdate[0] : errors.birthdate}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Giới tính *
            </label>
            <select
              value={registerData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={registerLoading}
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.gender) ? errors.gender[0] : errors.gender}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Số điện thoại *
            </label>
            <input
              type="tel"
              value={registerData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập số điện thoại (VD: 0794418470)"
              disabled={registerLoading}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.phone) ? errors.phone[0] : errors.phone}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Địa chỉ *
            </label>
            <textarea
              value={registerData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 resize-none ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập địa chỉ của bạn"
              rows="2"
              disabled={registerLoading}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.address) ? errors.address[0] : errors.address}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email *
            </label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập email của bạn"
              disabled={registerLoading}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Mật khẩu *
            </label>
            <input
              type="password"
              value={registerData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ít nhất 6 ký tự, có chữ hoa và số"
              disabled={registerLoading}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Xác nhận mật khẩu *
            </label>
            <input
              type="password"
              value={registerData.password_confirmation}
              onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 ${
                errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập lại mật khẩu"
              disabled={registerLoading}
            />
            {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}</p>}
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