  import React, { useState } from 'react';
  import { useProfile } from '../hooks/UserProfiles/useProfile';
  import ProfileAvatar from '../components/ProfileAvatar';
  import ProfileForm from '../components/ProfileForm';
  import ChangePasswordModal from '../components/ChangePasswordModal';
  import SpendingMeter from '../components/SpendingMeter';
  import ContactInfo from '../components/ContactInfo';
  import { useMembership } from '../contexts/MembershipContext';
import { BadgeCheck } from 'lucide-react';
  const ProfilePage = () => {
    const { profile, loading, error, updateProfile, changePassword } = useProfile();
    const { membership, points, totalPoints, memberType, loading: membershipLoading } = useMembership();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpdateProfile = async (formData) => {
      try {
        const result = await updateProfile(formData);
        setMessage('Cập nhật thông tin thành công!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Có lỗi xảy ra khi cập nhật profile');
        setTimeout(() => setMessage(''), 3000);
      }
    };

    const handleChangePassword = async (passwordData) => {
      try {
        const result = await changePassword(passwordData);
        setMessage('Đổi mật khẩu thành công!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        throw error;
      }
    };

    if (error && !profile) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mx-4 mt-4">
            {message}
          </div>
        )}
        
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center mb-6">
                  <ProfileAvatar name={profile?.name } />
                       <div className="flex justify-center items-center gap-2 mt-2">
                          <BadgeCheck className="w-6 h-6 text-yellow-500 fill-red-700" />
                          <h2 className="text-xl font-semibold text-gray-900">
                            {profile?.name || 'User'}
                       
                          </h2>
                         
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-yellow-600 ">
                            🎖️{points} điểm 
                          </span>
                        </div>
                </div>
              
              <SpendingMeter 
                currentAmount={totalPoints}
                maxAmount={1000}
                title="Tiến độ tích ⭐ thành viên"
                unit="⭐"
              />
                <ContactInfo />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <ProfileForm
                  profile={profile}
                  onSave={handleUpdateProfile}
                  loading={loading}
                  onOpenPasswordModal={() => setShowPasswordModal(true)}
                />
              </div>
            
            </div>
          </div>
        </div>

        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onChangePassword={handleChangePassword}
          loading={loading}
        />
      </div>
    );
  };

  export default ProfilePage;