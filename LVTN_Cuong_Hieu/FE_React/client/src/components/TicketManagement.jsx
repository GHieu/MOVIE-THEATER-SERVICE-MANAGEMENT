// components/TicketManagement.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, CreditCard, X, Filter, Trash2 } from 'lucide-react';
import useBooking2 from '../hooks/useBookingSucces';

const TicketManagement = () => {
  const {
    tickets,
    loading,
    error,
    loadTicketHistory,
    cancelBooking,
    filterTicketsByDate
  } = useBooking2();
  const TICKETS_PER_PAGE = 4    ;
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    status: 'all'
  });
  const [cancellingTicket, setCancellingTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(tickets.length / TICKETS_PER_PAGE);
  const currentTickets = tickets.slice(
    (currentPage - 1) * TICKETS_PER_PAGE,
    currentPage * TICKETS_PER_PAGE
  );

useEffect(() => {
  // reset về trang 1 mỗi khi danh sách thay đổi (ví dụ khi filter lại)
  setCurrentPage(1);
}, [tickets]);

  useEffect(() => {
    loadTicketHistory();
  }, [loadTicketHistory]);

  const handleCancelTicket = async (ticketId, ticketCode) => {
    const confirmMessage = `Bạn có chắc chắn muốn hủy vé ${ticketCode}?\n\nLưu ý: Việc hủy vé có thể không được hoàn tiền tùy theo chính sách của rạp.`;
    
    if (window.confirm(confirmMessage)) {
      setCancellingTicket(ticketId);
      try {
        const success = await cancelBooking(ticketId);
        if (success) {
          alert('Hủy vé thành công!');
          // Reload ticket list to reflect changes
          await loadTicketHistory();
        } else {
          alert('Không thể hủy vé. Vui lòng thử lại sau.');
        }
      } catch (error) {
        alert('Có lỗi xảy ra khi hủy vé. Vui lòng thử lại.');
        console.error('Cancel ticket error:', error);
      } finally {
        setCancellingTicket(null);
      }
    }
  };

  const handleApplyFilters = async () => {
    const filterParams = {};
    if (filters.from_date) filterParams.from_date = filters.from_date;
    if (filters.to_date) filterParams.to_date = filters.to_date;
    if (filters.status !== 'all') filterParams.status = filters.status;

    if (Object.keys(filterParams).length > 0) {
      await filterTicketsByDate(filterParams);
    } else {
      await loadTicketHistory();
    }
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ from_date: '', to_date: '', status: 'all' });
    loadTicketHistory();
    setShowFilters(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'confirmed':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'used':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'Đã thanh toán';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'active':
        return 'Hoạt động';
      case 'cancelled':
        return 'Đã hủy';
      case 'pending':
        return 'Chờ xử lý';
      case 'used':
        return 'Đã sử dụng';
      default:
        return status || 'Không xác định';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const canCancelTicket = (ticket) => {
    const status = ticket.status?.toLowerCase();
    const showDate = new Date(ticket.showtime?.start_time);
    const now = new Date();
    
    // Can only cancel paid tickets and show date is in the future
    return status === 'paid' && showDate > now;
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
  const getSeatsString = (details) => {
    if (!details || !Array.isArray(details)) return 'N/A';
    return details.map(detail => detail.seat_number).join(', ');
  };
  
  const getServicesString = (serviceOrders) => {
    if (!serviceOrders || !Array.isArray(serviceOrders) || serviceOrders.length === 0) return null;
    return serviceOrders.map(order => 
      `${order.service?.name} x${order.quantity}`
    ).join(', ');
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Lịch sử mua vé</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Lọc vé
          </button>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={filters.from_date}
                  onChange={(e) => setFilters({...filters, from_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={filters.to_date}
                  onChange={(e) => setFilters({...filters, to_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
         
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Áp dụng
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="p-6">
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎫</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có vé nào
            </h3>
            <p className="text-gray-500">
              Bạn chưa đặt vé nào. Hãy đặt vé để xem phim nhé!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentTickets.map((ticket) => {
              const showDateTime = formatDateTime(ticket.showtime?.start_time);
              const seats = getSeatsString(ticket.details);
              const services = getServicesString(ticket.service_orders);
              
              return (
                <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {ticket.showtime?.movie?.title || 'Tên phim'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{showDateTime.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{showDateTime.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{ticket.showtime?.room?.name} ({getRoomTypeName(ticket.showtime?.room?.type)})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Ghế: {seats}</span>
                        </div>
                      </div>
                      
                      {services && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Dịch vụ: </span>
                          <span>{services}</span>
                        </div>
                      )}
                      
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {formatCurrency(ticket.total_price)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Mã vé: {ticket.id}
                        </div>
                      </div>
                    </div>
                  
                    <div className="flex gap-2 ml-4">
                      {canCancelTicket(ticket) && (
                        <button
                          onClick={() => handleCancelTicket(ticket.id, ticket.id)}
                          disabled={cancellingTicket === ticket.id}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Hủy vé"
                        >
                          {cancellingTicket === ticket.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                              Đang hủy...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Hủy vé
                            </>
                          )}
                        </button>
                      )}
                      
                      {ticket.status?.toLowerCase() === 'cancelled' && (
                        <div className="px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-md">
                          Đã hủy
                        </div>
                      )}
                      
                      {ticket.status?.toLowerCase() === 'used' && (
                        <div className="px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-md">
                          Đã sử dụng
                        </div>
                      )}
                      
                      {!canCancelTicket(ticket) && ticket.status?.toLowerCase() === 'paid' && (
                        <div className="px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-md">
                          Không thể hủy
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {totalPages > 1 && (
  <div className="flex justify-center mt-6">
    <nav className="inline-flex rounded-md shadow-sm">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        Trang trước
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 py-1 border-t border-b border-gray-300 text-sm font-medium ${
            currentPage === page
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        Trang sau
      </button>
    </nav>
  </div>
)}

      </div>
    </div>
  );
};

export default TicketManagement;