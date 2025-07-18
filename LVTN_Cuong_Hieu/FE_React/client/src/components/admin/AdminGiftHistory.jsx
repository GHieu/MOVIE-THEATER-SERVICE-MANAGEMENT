import React, { useState } from 'react';
import { useAdminGiftHistory } from '../../hooks/Admin/useAdminGiftHistory';
import { Search, Calendar, User, Gift, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminGiftHistory = () => {
  const {
    giftHistory,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    clearFilters,
    refresh,
    hasData,
    isEmpty,
    hasError
  } = useAdminGiftHistory();

  const [localFilters, setLocalFilters] = useState({
    customer: '',
    gift: '',
    from_date: '',
    to_date: ''
  });

  const handleSearch = () => {
    updateFilters(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({
      customer: '',
      gift: '',
      from_date: '',
      to_date: ''
    });
    clearFilters();
  };

  const handleInputChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = pagination.current_page;
    const total = pagination.last_page;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Lịch sử đổi quà</h1>
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
          <p className="text-gray-600 mt-2">Quản lý và theo dõi lịch sử đổi quà của khách hàng</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Bộ lọc tìm kiếm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" /> Tên khách hàng
              </label>
              <input
                type="text"
                value={localFilters.customer}
                onChange={(e) => handleInputChange('customer', e.target.value)}
                placeholder="Nhập tên khách hàng..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Gift className="w-4 h-4 inline mr-1" /> Tên quà
              </label>
              <input
                type="text"
                value={localFilters.gift}
                onChange={(e) => handleInputChange('gift', e.target.value)}
                placeholder="Nhập tên quà..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" /> Từ ngày
              </label>
              <input
                type="date"
                value={localFilters.from_date}
                onChange={(e) => handleInputChange('from_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" /> Đến ngày
              </label>
              <input
                type="date"
                value={localFilters.to_date}
                onChange={(e) => handleInputChange('to_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Search className="w-4 h-4" /> Tìm kiếm
            </button>
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              <X className="w-4 h-4" /> Xóa bộ lọc
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Kết quả ({pagination.total} bản ghi)</h3>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          )}

          {hasError && (
            <div className="px-6 py-12 text-center">
              <div className="text-red-600 mb-2">⚠️ Có lỗi xảy ra</div>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={refresh}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          )}

          {isEmpty && !loading && (
            <div className="px-6 py-12 text-center">
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Không tìm thấy lịch sử đổi quà nào</p>
            </div>
          )}

          {hasData && !loading && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quà tặng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian đổi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {giftHistory.map((history) => (
                      <tr key={history.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{history.customer?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{history.customer?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{history.gift?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{formatDate(history.exchanged_at)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.last_page > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Hiển thị {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} của {pagination.total} bản ghi
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => changePage(pagination.current_page - 1)}
                        disabled={pagination.current_page <= 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      {getPageNumbers().map((page) => (
                        <button
                          key={page}
                          onClick={() => changePage(page)}
                          className={`px-3 py-1 text-sm rounded-md ${page === pagination.current_page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => changePage(pagination.current_page + 1)}
                        disabled={pagination.current_page >= pagination.last_page}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGiftHistory;