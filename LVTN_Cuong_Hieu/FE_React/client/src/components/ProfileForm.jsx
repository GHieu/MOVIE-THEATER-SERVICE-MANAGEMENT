import React, { useEffect } from 'react';
import { useForm } from '../hooks/UserProfiles/useForm';

const ProfileForm = ({ profile, onSave, loading, onOpenPasswordModal }) => {
  const validate = (values) => {
    const errors = {};
    
    if (!values.email?.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (values.phone && !/^[0-9]{10,11}$/.test(values.phone)) {
      errors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }
    
    return errors;
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues
  } = useForm({
    email: '',
    phone: '',
    address: ''
  }, validate);

  useEffect(() => {
    if (profile) {
      setValues({
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile, setValues]);

  const onSubmit = async (formData) => {
    await onSave(formData);
  };

  if (loading && !profile) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>;
  }

  return (
    <div className="bg-white">
      <div className="border-b">
        <div className="flex space-x-8">
          <button className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium">
            Thông Tin Cá Nhân
          </button>
          <button className="py-4 px-1 text-gray-500 hover:text-gray-700">Thông Báo</button>
          <button className="py-4 px-1 text-gray-500 hover:text-gray-700">Quà Tặng</button>
          <button className="py-4 px-1 text-gray-500 hover:text-gray-700">Chính Sách</button>
        </div>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit);
      }} className="p-6 space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
          <input
            type="text"
            value={profile?.name || 'Game'}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
            <input
              type="text"
              value={profile?.birthdate ? new Date(profile.birthdate).toLocaleDateString('vi-VN') : '13/12/2003'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            <div className="relative">
              <input
                type="tel"
                value={values.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                className={`w-full px-3 py-2 border rounded-lg pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone && touched.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập số điện thoại"
              />
              <button 
                type="button" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-500 text-sm hover:text-orange-600"
              >
                Thay đổi
              </button>
            </div>
            {errors.phone && touched.phone && (
              <span className="text-red-500 text-sm mt-1">{errors.phone}</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
          <div className="relative">
            <input
              type="password"
              value="••••••••••"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 pr-20"
            />
            <button 
              type="button" 
              onClick={onOpenPasswordModal}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-500 text-sm hover:text-orange-600"
            >
              Thay đổi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-3 py-2 border rounded-lg pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập email"
              />
              <button 
                type="button" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-500 text-sm hover:text-orange-600"
              >
                Thay đổi
              </button>
            </div>
            {errors.email && touched.email && (
              <span className="text-red-500 text-sm mt-1">{errors.email}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <div className="flex space-x-6 mt-2">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="gender" 
                  value="Nam"
                  defaultChecked={profile?.gender === 'Nam'}
                  className="mr-2"
                />
                Nam
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="gender" 
                  value="Nữ"
                  defaultChecked={profile?.gender === 'Nữ'}
                  className="mr-2"
                />
                Nữ
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
          <input
            type="text"
            value={values.address}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập địa chỉ"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full md:w-auto px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium"
        >
          {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;