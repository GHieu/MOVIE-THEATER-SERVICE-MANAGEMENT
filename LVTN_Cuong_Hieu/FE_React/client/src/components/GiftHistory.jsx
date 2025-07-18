import React from 'react';
import useGiftHistory from '../hooks/useGiftHistory';

// Base URL cho ảnh
const BASE_URL = 'http://127.0.0.1:8000/storage/';

const GiftHistory = ({ isOpen, onClose }) => {
  const { history, loading, error, refetch } = useGiftHistory();

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  

  

  // Hàm tạo URL ảnh đầy đủ
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Nếu imagePath đã chứa http/https thì không cần thêm BASE_URL
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">📋 Lịch sử đổi quà</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={refetch}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              🔄 Làm mới
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-2">Đang tải lịch sử...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-4xl mb-2">⚠️</div>
              <p className="text-red-600">Có lỗi xảy ra khi tải lịch sử</p>
              <button
                onClick={refetch}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>Bạn chưa có lịch sử đổi quà nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <div
                  key={item.id || index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      {/* Hiển thị ảnh từ gift.image hoặc item.image */}
                      {(item.gift?.image || item.image) ? (
                        <img
                          src={getImageUrl(item.gift?.image || item.image)}
                          alt={item.gift?.name || 'Quà tặng'}
                          className="w-12 h-12 object-cover rounded mr-3"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      
                      {/* Fallback icon nếu không có ảnh hoặc ảnh lỗi */}
                      <span 
                        className="text-3xl mr-3" 
                        style={{ display: (item.gift?.image || item.image) ? 'none' : 'block' }}
                      >
                        🎁
                      </span>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.gift?.name || 'Quà tặng'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(item.exchanged_at)}
                        </p>
                      </div>
                    </div>
                   
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {item.gift?.point_required && (
                      <div>
                        <span className="text-gray-500">Điểm sử dụng:</span>
                        <p className="font-medium text-red-600">-{item.gift.point_required}</p>
                      </div>
                    )}
                    {item.quantity && (
                      <div>
                        <span className="text-gray-500">Số lượng:</span>
                        <p className="font-medium">{item.quantity}</p>
                      </div>
                    )}
                    {item.gift?.point_required && (
                      <div>
                        <span className="text-gray-500">Giá trị:</span>
                        <p className="font-medium text-blue-600">{item.gift.point_required} điểm</p>
                      </div>
                    )}
                    {item.id && (
                      <div>
                        <span className="text-gray-500">Mã giao dịch:</span>
                        <p className="font-medium font-mono text-xs">#{item.id}</p>
                      </div>
                    )}
                  </div>

                  {/* Hiển thị thông tin khách hàng nếu có */}
                  {item.customer && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-gray-500 text-sm">Khách hàng:</span>
                      <p className="text-sm text-gray-700 mt-1">
                        {item.customer.name || item.customer.phone}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Tổng số giao dịch: {history.length}</span>
            <span>
              Tổng điểm đã sử dụng:{' '}
              {history.reduce((total, item) => total + (item.gift?.point_required || 0), 0)} điểm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftHistory;