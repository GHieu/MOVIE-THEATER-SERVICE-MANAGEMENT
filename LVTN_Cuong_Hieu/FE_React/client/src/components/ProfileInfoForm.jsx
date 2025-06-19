import React from 'react';

const ProfileInfoForm = ({ 
  profileForm, 
  setProfileForm, 
  validationErrors, 
  loading, 
  onSubmit 
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên *
          </label>
          <input
            type="text"
            value={profileForm.name}
            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập họ và tên"
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.name[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập email"
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.email[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại
          </label>
          <input
            type="text"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập số điện thoại"
          />
          {validationErrors.phone && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.phone[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ
          </label>
          <input
            type="text"
            value={profileForm.address}
            onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập địa chỉ"
          />
          {validationErrors.address && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.address[0]}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <span>Cập nhật thông tin</span>
        </button>
      </div>
    </form>
  );
};

export default ProfileInfoForm;