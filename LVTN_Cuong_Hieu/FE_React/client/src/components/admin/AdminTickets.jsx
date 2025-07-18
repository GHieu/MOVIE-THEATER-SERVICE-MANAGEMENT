import React, { useState } from 'react';
import { useAdminTickets } from '../../hooks/Admin/useAdminTickets';

const AdminTickets = () => {
  const {
    tickets,
    loading,
    error,
    pagination,
    filters,
    filterTicketsByDate,
    clearFilters,
    changePage,
    refreshTickets
  } = useAdminTickets();

  const [dateFilters, setDateFilters] = useState({
    fromDate: '',
    toDate: ''
  });

  // Xử lý submit form filter
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const fromDate = dateFilters.fromDate || null;
    const toDate = dateFilters.toDate || null;
    filterTicketsByDate(fromDate, toDate);
  };

  // Reset form và filters
  const handleClearFilters = () => {
    setDateFilters({ fromDate: '', toDate: '' });
    clearFilters();
  };

  // Format date để hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Get customer name
  const getCustomerName = (ticket) => {
    return ticket.customer?.name || 'N/A';
  };
const getRoomTypeName = (type) => {
    const roomTypeMap = {
      '2Dsub': '2D Phụ đề',
      '2Dcap': '2D Lồng tiếng',
      '3Dsub': '3D Phụ đề',
      '3Dcap': '3D Lồng tiếng',
      'IMAXsub': 'IMAX Phụ đề',
      'IMAXcap': 'IMAX Lồng tiếng'
    };
    
    return roomTypeMap[type] || type || 'Khác';
  };
  // Get movie and room info
  const getMovieInfo = (ticket) => {
    const movie = ticket.showtime?.movie?.title || 'N/A';
    const room = ticket.showtime?.room?.name || 'N/A';
    const type = getRoomTypeName(ticket.showtime?.room?.type || '');
    return `${movie} - ${room}: ${type}`.trim();
  };
  
  // Get seat numbers
  const getSeatNumbers = (ticket) => {
    if (ticket.details && ticket.details.length > 0) {
      return ticket.details.map(detail => detail.seat_number).join(', ');
    }
    return 'N/A';
  };

  // Get services info
  const getServicesInfo = (ticket) => {
    if (ticket.service_orders && ticket.service_orders.length > 0) {
      return ticket.service_orders.map(order => 
        `${order.service?.name} (x${order.quantity})`
      ).join(', ');
    }
    return 'Không có';
  };

  // Get status in Vietnamese
  const getStatusText = (status) => {
    const statusMap = {
      'paid': 'Đã thanh toán',
      'confirmed': 'Đã xác nhận',
      'cancelled': 'Đã hủy',
      'pending': 'Chờ xử lý'
    };
    return statusMap[status] || status;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render pagination
  const renderPagination = () => {
    if (filters.fromDate || filters.toDate) {
      return null; // Không hiển thị pagination khi đang filter
    }

    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => changePage(currentPage - 1)}
          className="px-3 py-2 mx-1 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          &lt;
        </button>
      );
    }

    // Page numbers
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => changePage(i)}
          className={`px-3 py-2 mx-1 border rounded-md ${
            i === currentPage
              ? 'bg-blue-500 text-white border-blue-500'
              : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => changePage(currentPage + 1)}
          className="px-3 py-2 mx-1 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          &gt;
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-6">
        <div className="flex items-center">
          {pages}
        </div>
        <div className="ml-4 text-sm text-gray-500">
          Trang {currentPage} / {totalPages} 
          ({pagination.totalItems} vé)
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý vé</h1>
        <button
          onClick={refreshTickets}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* Filter Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <h3 className="text-lg font-semibold mb-4">Lọc vé theo thời gian</h3>
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateFilters.fromDate}
              onChange={(e) => setDateFilters({...dateFilters, fromDate: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateFilters.toDate}
              onChange={(e) => setDateFilters({...dateFilters, toDate: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              disabled={loading}
            >
              Lọc
            </button>
            
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Xóa bộ lọc
            </button>
          </div>
        </form>
        
        {/* Active filters display */}
        {(filters.fromDate || filters.toDate) && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              Đang lọc: 
              {filters.fromDate && ` Từ ${formatDate(filters.fromDate)}`}
              {filters.toDate && ` Đến ${formatDate(filters.toDate)}`}
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      )}

      {/* Tickets Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phim - Phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số ghế
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dịch vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Không có vé nào
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getCustomerName(ticket)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getMovieInfo(ticket)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getSeatNumbers(ticket)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getServicesInfo(ticket)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(ticket.total_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(ticket.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && renderPagination()}
    </div>
  );
};

export default AdminTickets;