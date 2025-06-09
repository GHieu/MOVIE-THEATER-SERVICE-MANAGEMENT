import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen ">
      <div className="p-5 border-b border-gray-700">
        <h3 className="text-lg font-medium">Quản trị viên</h3>
      </div>
      
      <nav className="mt-5">
        <ul>
          <li>
            <button
              className={`flex items-center w-full py-3 px-5 text-left hover:bg-gray-700 transition-colors ${
                activeTab === 'movies' ? 'bg-blue-600' : ''
              }`}
              onClick={() => setActiveTab('movies')}
            >
              <span className="mr-2">📁</span>
              <span>Quản lý Phim</span>
            </button>
          </li>
          
          <li>
            <button
              className={`flex items-center w-full py-3 px-5 text-left hover:bg-gray-700 transition-colors ${
                activeTab === 'rooms' ? 'bg-blue-600' : ''
              }`}
              onClick={() => setActiveTab('rooms')}
            >
              <span className="mr-2">📁📝</span>
              <span>Quản lý Phòng</span>
            </button>
          </li>

          <li>
            <button
              className={`flex items-center w-full py-3 px-5 text-left hover:bg-gray-700 transition-colors ${
                activeTab === 'services' ? 'bg-blue-600' : ''
              }`}
              onClick={() => setActiveTab('services')}
            >
              <span className="mr-2">📁</span>
              <span>Quản lý dịch vụ</span>
            </button>
          </li>

           <li>
            <button
              className={`flex items-center w-full py-3 px-5 text-left hover:bg-gray-700 transition-colors ${
                activeTab === 'blogs' ? 'bg-blue-600' : ''
              }`}
              onClick={() => setActiveTab('blogs')}
            >
              <span className="mr-2">📁</span>
              <span>Quản lý Blog</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;