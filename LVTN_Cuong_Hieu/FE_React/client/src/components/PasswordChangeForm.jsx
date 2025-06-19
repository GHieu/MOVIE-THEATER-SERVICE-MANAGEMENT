import React from 'react';

const PasswordChangeForm = ({ 
  passwordForm, 
  setPasswordForm, 
  validationErrors, 
  loading, 
  onSubmit 
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mật khẩu hiện tại *
        </label>
        <input
          type="password"
          value={passwordForm.current_password}
          onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            validationErrors.current_password ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nhập mật khẩu hiện tại"
        />
        {validationErrors.current_password && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.current_password[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mật khẩu mới *
        </label>
        <input
          type="password"
          value={passwordForm.new_password}
          onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            validationErrors.new_password ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
        />
        {validationErrors.new_password && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.new_password[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Xác nhận mật khẩu mới *
        </label>
        <input
          type="password"
          value={passwordForm.new_password_confirmation}
          onChange={(e) => setPasswordForm({...passwordForm, new_password_confirmation: e.target.value})}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            validationErrors.new_password_confirmation ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nhập lại mật khẩu mới"
        />
        {validationErrors.new_password_confirmation && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.new_password_confirmation[0]}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <span>Đổi mật khẩu</span>
        </button>
      </div>
    </form>
  );
};

export default PasswordChangeForm;