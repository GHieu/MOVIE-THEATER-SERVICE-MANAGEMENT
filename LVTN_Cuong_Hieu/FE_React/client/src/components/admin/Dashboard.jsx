import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './AdminSidebar';
import AdminMovies from './AdminMovies';
import AdminRooms from './AdminRooms';
import AdminServices from './AdminServices';
import AdminBlog from './AdminBlogs';
import AdminPromotions from './AdminPromotions';
import AdminShowtimes from './AdminShowtimes';
import AdminSeats from './AdminSeats';
import AdminEmployees from './AdminEmployees';
import AdminMembership from './AdminMembership';
import AdminProfile from './AdminProfile';
import { userAdmin } from '../../services/ADMINS/authAdminServices';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('movies');
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        setLoading(true);
        const adminData = await userAdmin();
        setAdmin(adminData);
      } catch (error) {
        console.error('Không lấy được thông tin admin:', error);
        // Nếu lỗi authentication, redirect về login
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
    if (confirmed) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminLoggedIn');
      navigate('/admin/login', { replace: true });
    }
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  const renderTabContent = () => {
    const tabComponents = {
      movies: <AdminMovies />,
      rooms: <AdminRooms />,
      services: <AdminServices />,
      blogs: <AdminBlog />,
      promotions: <AdminPromotions />,
      showtimes: <AdminShowtimes />,
      seats: <AdminSeats />,
      employees: <AdminEmployees />,
      memberships: <AdminMembership />
    };
    
    return tabComponents[activeTab] || <div>Tab không tồn tại</div>;
  };

  const getTabTitle = () => {
    const tabTitles = {
      movies: 'Quản lý Phim',
      rooms: 'Quản lý Phòng',
      services: 'Quản lý Dịch vụ',
      blogs: 'Quản lý Blog',
      promotions: 'Quản lý Khuyến mãi',
      showtimes: 'Quản lý Xuất chiếu',
      seats: 'Quản lý Ghế ngồi',
      employees: 'Quản lý Nhân viên',
      memberships: 'Quản lý Thành viên'
    };
    
    return tabTitles[activeTab] || 'Bảng điều khiển';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex justify-between items-center px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{getTabTitle()}</h1>
              <p className="text-gray-600 text-sm mt-1">Quản lý hệ thống rạp chiếu phim</p>
            </div>

            <div className="flex items-center gap-4">
              {admin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {admin.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {admin.email}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}

              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border min-h-full">
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <AdminProfile onClose={handleCloseProfile} />
      )}
    </div>
  );
};

export default Dashboard;