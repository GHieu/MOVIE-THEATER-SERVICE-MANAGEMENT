import React from 'react';

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      key: 'info',
      label: 'Thông tin cá nhân',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      key: 'password',
      label: 'Đổi mật khẩu',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  return (
    <div className="border-b">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="flex items-center space-x-2">
              {tab.icon}
              <span>{tab.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileTabs;