import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams
import TicketManagement from './TicketManagement';
import GiftManagement from './GiftManagement';
// Mock useForm hook
const useForm = (initialValues, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const newErrors = validate({ ...values, [name]: value });
      setErrors(prev => ({ ...prev, [name]: newErrors[name] }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const newErrors = validate(values);
    setErrors(prev => ({ ...prev, [name]: newErrors[name] }));
  };

  const handleSubmit = async (onSubmit) => {
    setIsSubmitting(true);
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Submit error:', error);
      }
    }
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues
  };
};

const ProfileForm = ({ profile, onSave, loading, onOpenPasswordModal }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [searchParams, setSearchParams] = useSearchParams(); // Hook để quản lý params

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

  const getGenderDisplayText = (gender) => {
    switch(gender) {
      case 'male':
        return 'Nam';
      case 'female':
        return 'Nữ';
      case 'other':
        return 'Khác';
      default:
        return gender || '';
    }
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
    gender: '',
    address: ''
  }, validate);

  useEffect(() => {
    if (profile) {
      setValues({
        email: profile.email || 'user@example.com',
        phone: profile.phone || '0123456789',
        gender: profile.gender || 'male',
        address: profile.address || '123 Đường ABC, Quận 1, TP.HCM'
      });
    }
    // Đặt activeTab dựa trên params nếu có
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['personal', 'ticketManagement', 'notifications', 'gifts', 'policy'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [profile, setValues, searchParams]);

  const onSubmit = async (formData) => {
    console.log('Saving form data:', formData);
    if (onSave) {
      await onSave(formData);
    }
  };

  // Cập nhật tabs
  const tabs = [
    { id: 'personal', label: 'Thông Tin Cá Nhân', icon: '👤' },
    { id: 'ticketManagement', label: 'Quản lý Vé', icon: '🎟️' },
    { id: 'notifications', label: 'Thông Báo', icon: '🔔' },
    { id: 'giftManagement', label: 'Quà Tặng', icon: '🎁' },
    { id: 'policy', label: 'Chính Sách', icon: '📄' }
  ];

  if (loading && !profile) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>;
  }

  const renderPersonalInfo = () => (
    <div className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
        <input
          type="text"
          value={profile?.name || 'Game Player'}
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
            onClick={() => onOpenPasswordModal && onOpenPasswordModal()}
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
           
          </div>
          {errors.email && touched.email && (
            <span className="text-red-500 text-sm mt-1">{errors.email}</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
          <div className="relative">
            <input
              type="text"
              value={getGenderDisplayText(values.gender)}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 pr-20"
            />
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
        type="button"
        onClick={() => handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="w-full md:w-auto px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium transition-colors"
      >
        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
      </button>
    </div>
  );

  const renderTicketManagement = () => (
    <div className="p-6">
      <TicketManagement />
    </div>
  );

  const renderNotifications = () => (
    <div className="p-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Cài đặt thông báo</h3>
        
        <div className="space-y-4">
          {[
            { id: 'email', label: 'Thông báo qua Email', enabled: true },
            { id: 'sms', label: 'Thông báo qua SMS', enabled: false },
            { id: 'push', label: 'Thông báo đẩy', enabled: true },
            { id: 'promo', label: 'Thông báo khuyến mãi', enabled: true }
          ].map(notification => (
            <div key={notification.id} className="flex justify-between items-center p-3 bg-white rounded border">
              <span>{notification.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={notification.enabled} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGiftManagement = () => (
    <div className="p-6">
      <GiftManagement/>
    </div>
  );

  const renderPolicy = () => (
    <div className="p-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Chính sách và Điều khoản</h3>
        
        <div className="space-y-4">
          {[
            { title: 'Chính sách bảo mật', description: 'Cách chúng tôi bảo vệ thông tin cá nhân của bạn' },
            { id: 'terms', title: 'Điều khoản sử dụng', description: 'Quy định và điều kiện khi sử dụng dịch vụ' },
            { id: 'payment', title: 'Chính sách thanh toán', description: 'Thông tin về các phương thức thanh toán' },
            { id: 'refund', title: 'Chính sách hoàn tiền', description: 'Quy định về việc hoàn trả và đổi trả' }
          ].map((policy, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-medium text-blue-600 mb-2">{policy.title}</h4>
              <p className="text-sm text-gray-600">{policy.description}</p>
              <div className="mt-2 text-right">
                <span className="text-sm text-blue-500 hover:text-blue-700">Xem chi tiết →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'ticketManagement':
        return renderTicketManagement();
      case 'notifications':
        return renderNotifications();
      case 'giftManagement':
        return renderGiftManagement();
      case 'policy':
        return renderPolicy();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="border-b">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                // Cập nhật params khi click vào ticketManagement
                if (tab.id === 'ticketManagement') {
                  setSearchParams({ tab: 'ticketManagement' });
                } else {
                  setSearchParams({}); // Xóa params nếu không phải ticketManagement
                }
              }}
              className={`py-4 px-5 whitespace-nowrap font-medium transition-colors border-b-2 flex items-center space-x-2 min-w-max ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfileForm;