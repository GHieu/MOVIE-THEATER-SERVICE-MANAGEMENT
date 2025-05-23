import React from 'react';
import { Link } from 'react-router-dom';
export default function Navbar() {
  return (
    <header className="bg-black text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to= "/homepage" className="text-2xl font-bold text-yellow-400">AbsoluteCinema</Link>

        {/* Menu chính */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="#" className="hover:text-yellow-400 transition">Lịch chiếu</a>
          <Link to="/movies" className="hover:text-yellow-400 transition">Phim</Link>
          <a href="#" className="hover:text-yellow-400 transition">Rạp</a>
          <a href="#" className="hover:text-yellow-400 transition">Tin tức</a>
          <a href="#" className="hover:text-yellow-400 transition">Thành viên</a>
        </nav>

        {/* Đăng nhập / Đăng ký */}
        <div className="flex items-center space-x-2 text-sm">
        <Link to = "/login">
            <button className="hover:text-yellow-400 transition">Đăng nhập</button>
        </Link>
        <span className="text-gray-500">|</span>
        <Link to = "/register">
            <button className="hover:text-yellow-400 transition">Đăng ký</button>
        </Link>
          
          
          
        </div>
      </div>
    </header>
  );
}
