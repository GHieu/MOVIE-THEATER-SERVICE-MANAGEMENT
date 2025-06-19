import React from 'react';
import { useForm } from '../hooks/UserProfiles/useForm';

const ChangePasswordModal = ({ isOpen, onClose, onChangePassword, loading }) => {
  const validate = (values) => {
    const errors = {};
    
    if (!values.current_password) {
      errors.current_password = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!values.new_password) {
      errors.new_password = 'Vui lòng nhập mật khẩu mới';
    } else if (values.new_password.length < 6) {
      errors.new_password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!values.new_password_confirmation) {
      errors.new_password_confirmation = 'Vui lòng xác nhận mật khẩu';
    } else if (values.new_password !== values.new_password_confirmation) {
      errors.new_password_confirmation = 'Mật khẩu xác nhận không khớp';
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
    reset,
    setServerErrors
  } = useForm({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  }, validate);

  const onSubmit = async (formData) => {
    try {
      const passwordData = {
        current_password: formData.current_password,
        new_password: formData.new_password,
        new_password_confirmation: formData.new_password_confirmation
      };
      
      await onChangePassword(passwordData);
      reset();
      onClose();
    } catch (error) {
      console.error('Password change error:', error);
      
      // Handle server validation errors
      if (error.response?.data?.errors) {
        setServerErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        // Handle single error message
        setServerErrors({ 
          current_password: error.response.data.message 
        });
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(onSubmit);
  };

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Đổi mật khẩu</h3>
          <button 
            className="text-gray-400 hover:text-gray-600 text-xl transition-colors" 
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleFormSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={values.current_password}
                onChange={(e) => handleChange('current_password', e.target.value)}
                onBlur={() => handleBlur('current_password')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.current_password && touched.current_password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập mật khẩu hiện tại"
                disabled={isSubmitting}
              />
              {errors.current_password && touched.current_password && (
                <span className="text-red-500 text-sm mt-1 block">{errors.current_password}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={values.new_password}
                onChange={(e) => handleChange('new_password', e.target.value)}
                onBlur={() => handleBlur('new_password')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.new_password && touched.new_password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập mật khẩu mới"
                disabled={isSubmitting}
              />
              {errors.new_password && touched.new_password && (
                <span className="text-red-500 text-sm mt-1 block">{errors.new_password}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={values.new_password_confirmation}
                onChange={(e) => handleChange('new_password_confirmation', e.target.value)}
                onBlur={() => handleBlur('new_password_confirmation')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.new_password_confirmation && touched.new_password_confirmation ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Xác nhận mật khẩu mới"
                disabled={isSubmitting}
              />
              {errors.new_password_confirmation && touched.new_password_confirmation && (
                <span className="text-red-500 text-sm mt-1 block">{errors.new_password_confirmation}</span>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;