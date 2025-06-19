import api from './api';

export const profileService = {
  /**
   * Lấy thông tin profile từ API Laravel
   */
  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      
      // Check if response has success flag
      if (response.success === false) {
        throw new Error(response.message || 'Không thể lấy thông tin profile');
      }
      
      return response.data || response;
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // Handle different error types
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn');
        } else if (status === 404) {
          throw new Error('Không tìm thấy thông tin khách hàng');
        } else if (data?.message) {
          throw new Error(data.message);
        }
      }
      
      throw new Error('Có lỗi xảy ra khi lấy thông tin profile');
    }
  },

  /**
   * Cập nhật profile
   */
  updateProfile: async (profileData) => {
    try {
      // Filter out empty/null values
      const cleanData = Object.entries(profileData).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await api.post('/profile', cleanData);
      
      if (response.success === false) {
        throw new Error(response.message || 'Không thể cập nhật profile');
      }
      
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 422 && data.errors) {
          // Validation errors
          const validationError = new Error('Dữ liệu không hợp lệ');
          validationError.errors = data.errors;
          throw validationError;
        } else if (data?.message) {
          throw new Error(data.message);
        }
      }
      
      throw new Error('Có lỗi xảy ra khi cập nhật profile');
    }
  },

  /**
   * Đổi mật khẩu
   */
  changePassword: async (passwordData) => {
    try {
      console.log('Sending password change request:', {
        ...passwordData,
        current_password: '[HIDDEN]',
        new_password: '[HIDDEN]',
        new_password_confirmation: '[HIDDEN]'
      });

      // Validate required fields
      const requiredFields = ['current_password', 'new_password', 'new_password_confirmation'];
      const missingFields = requiredFields.filter(field => !passwordData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Thiếu thông tin: ${missingFields.join(', ')}`);
      }

      // Check password confirmation
      if (passwordData.new_password !== passwordData.new_password_confirmation) {
        const error = new Error('Mật khẩu xác nhận không khớp');
        error.errors = {
          new_password_confirmation: ['Mật khẩu xác nhận không khớp']
        };
        throw error;
      }

      const response = await api.post('/profile/change-password', passwordData);
      
      console.log('Password change success:', response);
      
      if (response.success === false) {
        const error = new Error(response.message || 'Không thể đổi mật khẩu');
        if (response.errors) {
          error.errors = response.errors;
        }
        throw error;
      }
      
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        console.error('Error details:', {
          status,
          data,
          headers: error.response.headers
        });
        
        if (status === 422) {
          // Validation or business logic errors
          const validationError = new Error(data.message || 'Dữ liệu không hợp lệ');
          if (data.errors) {
            validationError.errors = data.errors;
          }
          throw validationError;
        } else if (status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn');
        } else if (data?.message) {
          throw new Error(data.message);
        }
      } else if (error.errors) {
        // Client-side validation error
        throw error;
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('Không thể kết nối đến server');
      }
      
      throw new Error(error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    }
  }
};