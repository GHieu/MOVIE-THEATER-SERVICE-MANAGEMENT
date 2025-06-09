// src/component/Admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './AdminSidebar';
import AdminMovies from './AdminMovies';
import AdminRooms from './AdminRooms';
import { userAdmin } from '../../services/ADMINS/authAdminServices';
import AdminServices from './AdminServices';
import AdminBlog from './AdminBlogs';
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchAdmin = async () => {
    try {
      const adminData = await userAdmin();
      setAdmin(adminData);
    } catch (error) {
      console.error('Không lấy được thông tin admin:', error);
    }
  };

  fetchAdmin();
}, []);


  const handleLogout = () => {
  localStorage.removeItem('adminToken');       // Xóa token
  localStorage.removeItem('adminLoggedIn');    // Nếu có dùng biến này để check login
  navigate('/admin/login');
};

  return (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
    
    <div className="flex-1">
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h2 className="text-xl font-semibold text-gray-800">Bảng điều khiển quản trị</h2>

        <div className="flex items-center gap-x-4">
          {admin && (
            <span className="text-gray-700 font-medium">
              Xin chào, {admin.name}
            </span>
          )}

          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div> {/* Đóng div thanh header */}

      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'movies' && <AdminMovies />}
          {activeTab === 'rooms' && <AdminRooms/>}
          {activeTab === 'services' && <AdminServices/>}
          {activeTab === 'blogs' && <AdminBlog/>}
        </div>
      </div>
    </div>
  </div>
);
}

export default Dashboard;