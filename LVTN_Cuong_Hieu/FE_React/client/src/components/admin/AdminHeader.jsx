import React from "react";

const AdminHeader = ({ onLogout }) => {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
      <h2 className="text-xl font-semibold text-gray-800">Bảng điều khiển quản trị</h2>
      <button
        onClick={onLogout}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Đăng xuất
      </button>
    </div>
  );
};

export default AdminHeader;
