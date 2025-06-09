import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error("Lỗi đọc user từ localStorage:", e);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-white text-black  ">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-10  ">
        <Link to="/homepage" className="text-2xl font-bold text-yellow-400">
          AbsoluteCinema
        </Link>

        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <Link to="/schedule" className="hover:text-yellow-400 transition">Lịch chiếu</Link>
          <Link to="/movies" className="hover:text-yellow-400 transition">Phim</Link>
          <Link to="/cinemas" className="hover:text-yellow-400 transition">Rạp</Link>
          <Link to="/news" className="hover:text-yellow-400 transition">Tin tức</Link>
          <Link to="/members" className="hover:text-yellow-400 transition">Thành viên</Link>
        </nav>

        <div className="flex items-center space-x-2 text-sm">
          {user ? (
            <>
              <span className="text-yellow-400">Xin chào, {user.name}</span>
              <button onClick={handleLogout} className="hover:text-yellow-400 transition">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="hover:text-yellow-400 transition">Đăng nhập</button>
              </Link>
              <span className="text-gray-500">|</span>
              <Link to="/register">
                <button className="hover:text-yellow-400 transition">Đăng ký</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
