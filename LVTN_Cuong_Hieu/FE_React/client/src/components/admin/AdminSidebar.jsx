import React from 'react';

const menuItems = [
  { id: 'movies', icon: '🎬', label: 'Quản lý Phim' },
  { id: 'rooms', icon: '🏠', label: 'Quản lý Phòng' },
  { id: 'services', icon: '🛎️', label: 'Quản lý Dịch vụ' },
  { id: 'blogs', icon: '📝', label: 'Quản lý Blog' },
  { id: 'promotions', icon: '🎫', label: 'Quản lý Khuyến mãi' },
  { id: 'showtimes', icon: '🕐', label: 'Quản lý Xuất chiếu' },
  { id: 'seats', icon: '🪑', label: 'Quản lý Ghế ngồi' },
  { id: 'employees', icon: '👥', label: 'Quản lý Nhân viên' },
  { id: 'memberships', icon: '👤', label: 'Quản lý Thành viên' }
];

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen shadow-lg">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-xl font-bold text-white">Admin Panel</h3>
        <p className="text-gray-300 text-sm mt-1">Hệ thống quản trị</p>
      </div>
      
      <nav className="mt-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`flex items-center w-full py-3 px-6 text-left hover:bg-gray-700 transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-blue-600 border-r-4 border-blue-400 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      
    </div>
  );
};

export default Sidebar;