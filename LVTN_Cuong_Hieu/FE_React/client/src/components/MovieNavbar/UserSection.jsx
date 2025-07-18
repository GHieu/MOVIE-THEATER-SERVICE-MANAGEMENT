import React, { useState, useRef, useEffect } from "react";
import { logoutUser } from "../../services/authService";

export default function UserSection({ user, onShowLogin, onShowRegister }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const handleLogout = () => {
    logoutUser();
    setIsDropdownOpen(false);
    // Reload trang để cập nhật UI
    window.location.reload();
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center space-x-3">
      {user ? (
        <div className="relative" ref={dropdownRef}>
          {/* User Avatar và Dropdown Toggle */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 hover:bg-yellow-400 px-3 py-2 rounded-lg transition-colors duration-200"
          >
            {/* Avatar */}
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            
            {/* User Name */}
            <span className="text-black font-medium">{user.name}</span>
            
            {/* Dropdown Arrow */}
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
             

              {/* Menu Items */}
              <div className="py-1">
                <a 
                  href="/profile" 
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-amber-300 transition-colors duration-150"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Tài Khoản
                </a>
                
                <a 
                  href="/profile?tab=ticketManagement" 
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-amber-300 transition-colors duration-150"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Lịch Sử
                </a>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-amber-300 transition-colors duration-150"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Đăng Xuất
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <button
            onClick={onShowLogin}
            className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 px-4 py-2 rounded-lg transition font-medium"
          >
            Đăng nhập
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={onShowRegister}
            className="border border-yellow-400 text-gray-900 font-medium hover:bg-yellow-400 hover:text-gray-900 px-4 py-2 rounded-lg transition"
          >
            Đăng ký
          </button>
        </>
      )}
    </div>
  );
}