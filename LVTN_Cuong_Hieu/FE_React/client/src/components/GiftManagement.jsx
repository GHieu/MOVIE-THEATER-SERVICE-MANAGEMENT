import React, { useState } from 'react';
import { useGifts } from '../hooks/useGift';
import { useMembership } from '../contexts/MembershipContext';
import GiftHistory from './GiftHistory';

const GiftManagement = () => {
  const { 
    gifts, 
    loading, 
    error, 
    exchangeLoading, 
    exchangeGift, 
    refetch 
  } = useGifts();
  const { updatePoints } = useMembership(); // ✅ Sử dụng updatePoints thay vì refetchMembership
  const [exchangingGiftId, setExchangingGiftId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showHistory, setShowHistory] = useState(false); // ✅ State cho history modal

  const handleExchange = async (giftId) => {
    setExchangingGiftId(giftId);
    const result = await exchangeGift(giftId);
    
    setNotification({
      show: true,
      message: result.message,
      type: result.success ? 'success' : 'error'
    });

    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
    
    if (result.success) {
      updatePoints(); // ✅ Chỉ update points, không re-render component
    }
    setExchangingGiftId(null);
  };

  const isGiftExchangeable = (gift) => {
    return gift.stock > 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2">Đang tải danh sách quà tặng...</span>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Quà tặng của bạn</h3>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            🔄 Làm mới
          </button>
        </div>

        {notification.show && (
          <div className={`mb-4 p-3 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {notification.message}
          </div>
        )}

        {gifts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎁</div>
            <p>Bạn chưa có quà tặng nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gifts.map(gift => (
              <div key={gift.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  {gift.imageUrl ? (
                    <img 
                      src={gift.imageUrl} 
                      alt={gift.name || 'Quà tặng'} 
                      className="w-8 h-8 mr-2 object-cover rounded"
                      onError={(e) => (e.target.src = '/path/to/fallback-image.jpg')}
                    />
                  ) : (
                    <span className="text-2xl mr-2">🎁</span>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 line-clamp-2">
                      {gift.name || 'Quà tặng'}
                    </h4>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {gift.point_required && (
                    <p className="text-sm text-blue-600">
                      Yêu cầu: {gift.point_required} điểm
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Số lượng còn lại: {gift.stock}
                  </p>
                  {gift.promotion && gift.promotion.name && (
                    <p className="text-sm text-gray-600">
                      Khuyến mãi: {gift.promotion.name}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    gift.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {gift.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                  </span>

                  {isGiftExchangeable(gift) && (
                    <button
                      onClick={() => handleExchange(gift.id)}
                      disabled={exchangeLoading || exchangingGiftId === gift.id}
                      className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {exchangingGiftId === gift.id ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                          Đang đổi...
                        </span>
                      ) : (
                        'Đổi quà'
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center border-t pt-4">
          <button 
            onClick={() => setShowHistory(true)} // ✅ Mở history modal
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            📋 Xem lịch sử đổi quà
          </button>
        </div>
      </div>

      {/* History Modal */}
      <GiftHistory 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </>
  );
};

export default GiftManagement;