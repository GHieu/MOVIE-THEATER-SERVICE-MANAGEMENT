// components/MembershipModal/MembershipModal.js
import React, { useState } from 'react';
import { useMembership } from '../../hooks/useMembership';

const MembershipModal = ({ isOpen, onClose, onSuccess }) => {
  const { registerMembershipCard, loading } = useMembership();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const membershipTypes = [
    {
      type: 'Silver',
      name: 'Thẻ Bạc',
      color: 'bg-gray-400',
      textColor: 'text-gray-800',
      benefits: ['Tích điểm cơ bản', 'Giảm giá 5%', 'Ưu tiên đặt vé'],
      requirement: 'Mặc định cho thành viên mới'
    },
    {
      type: 'Gold',
      name: 'Thẻ Vàng',
      color: 'bg-yellow-400',
      textColor: 'text-yellow-800',
      benefits: ['Tích điểm x2', 'Giảm giá 10%', 'Ưu tiên cao', 'Combo miễn phí'],
      requirement: 'Đạt 300 điểm tích lũy để nâng cấp'
    },
    {
      type: 'Diamond',
      name: 'Thẻ Kim Cương',
      color: 'bg-blue-400',
      textColor: 'text-blue-800',
      benefits: ['Tích điểm x3', 'Giảm giá 15%', 'VIP lounge', 'Vé miễn phí hàng tháng'],
      requirement: 'Đạt 1000 điểm tích lũy để nâng cấp'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const result = await registerMembershipCard();
      
      if (result.success) {
        setMessage('Đăng ký thẻ thành viên Bạc thành công!');
        if (onSuccess) {
          onSuccess(result.membership);
        }
        setTimeout(() => {
          onClose();
          setMessage('');
        }, 1500);
      } else {
        setMessage(result.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Có lỗi xảy ra, vui lòng thử lại');
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Thông tin thẻ thành viên</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded mb-4 ${
              message.includes('thành công') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              {membershipTypes.map((type) => (
                <div
                  key={type.type}
                  className="border-2 rounded-lg p-4 border-gray-200"
                >
                  <div className="flex items-center mb-2">
                    <div className={`px-3 py-1 rounded-full ${type.color} ${type.textColor} font-semibold`}>
                      {type.name}
                    </div>
                  </div>
                  <div className="ml-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Quyền lợi:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {type.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 text-xs text-gray-500">
                      {type.requirement}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;