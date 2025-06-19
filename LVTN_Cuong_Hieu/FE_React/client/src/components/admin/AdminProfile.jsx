import React, { useState } from 'react';
import { useAdminProfile } from '../../hooks/Admin/useAdminProfiles';
import ProfileTabs from '../../components/ProfileTabs';
import ProfileInfoForm from '../../components/ProfileInfoForm';
import PasswordChangeForm from '../../components/PasswordChangeForm';
import NotificationMessage from '../../components/NotificationMessage';

const AdminProfile = ({ onClose }) => {
  const { profile, loading, error, updateProfile, changePassword } = useAdminProfile();
  const [activeTab, setActiveTab] = useState('info');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  // Clear messages
  const clearMessages = () => {
    setValidationErrors({});
    setSuccessMessage('');
  };

  // Handle profile form submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    
    try {
      await updateProfile(profileForm);
      setSuccessMessage('Cập nhật thông tin thành công!');
    } catch (err) {
      if (err.errors) {
        setValidationErrors(err.errors);
      }
    }
  };

  // Handle password form submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    
    try {
      await changePassword(passwordForm);
      setSuccessMessage('Đổi mật khẩu thành công!');
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    } catch (err) {
      if (err.errors) {
        setValidationErrors(err.errors);
      }
    }
  };

  // Loading state
  if (loading && !profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Đang tải thông tin...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Thông tin Admin</h2>
              <p className="text-blue-100 mt-1">Quản lý thông tin cá nhân</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Notification Messages */}
          <NotificationMessage error={error} successMessage={successMessage} />

          {/* Tab Content */}
          {activeTab === 'info' && (
            <ProfileInfoForm
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              validationErrors={validationErrors}
              loading={loading}
              onSubmit={handleProfileSubmit}
            />
          )}

          {activeTab === 'password' && (
            <PasswordChangeForm
              passwordForm={passwordForm}
              setPasswordForm={setPasswordForm}
              validationErrors={validationErrors}
              loading={loading}
              onSubmit={handlePasswordSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;