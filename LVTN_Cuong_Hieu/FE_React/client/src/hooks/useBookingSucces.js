// hooks/useBooking.js
import { useState, useCallback } from 'react';
import { 
  bookTicket, 
  fetchTicketHistory, 
  fetchTicketDetails, 
  cancelTicket, 
  filterTickets,
  checkPaymentStatus,
  vnpayCallback
} from '../services/apibooking';

const useBooking2 = () => {
  const [bookingData, setBookingData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Đặt vé
  const createBooking = useCallback(async (bookingInfo, originalBookingData = null) => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== HOOK: BEFORE API ===');
      console.log('bookingInfo:', JSON.stringify(bookingInfo, null, 2));
      console.log('originalBookingData:', JSON.stringify(originalBookingData, null, 2));
      
      const result = await bookTicket(bookingInfo);
      
      console.log('=== HOOK: API RESPONSE ===');
      console.log('Raw API result:', JSON.stringify(result, null, 2));
      
      // KIỂM TRA LOGIC MERGE
      let finalBookingData = result;
      
      if (originalBookingData) {
        console.log('=== HOOK: MERGING DATA ===');
        console.log('Before merge - finalBookingData:', JSON.stringify(finalBookingData, null, 2));
        
        if (result.booking_data) {
          finalBookingData = {
            ...result,
            ...result.booking_data
          };
          console.log('Used booking_data from API');
        } else {
          finalBookingData = {
            ...originalBookingData,
            ...result,
            finalTotal: result.total,
            bookingTotal: originalBookingData.bookingTotal,
            serviceTotal: originalBookingData.serviceTotal,
            ticket_id: result.ticket_id
          };
          console.log('Merged with original data');
        }
        
        console.log('After merge - finalBookingData:', JSON.stringify(finalBookingData, null, 2));
      }
      
      console.log('=== HOOK: FINAL RESULT ===');
      console.log('Final booking data:', JSON.stringify(finalBookingData, null, 2));
      
      setBookingData(finalBookingData);
      return finalBookingData;
    } catch (err) {
      console.error('Booking error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy lịch sử đặt vé
  const loadTicketHistory = useCallback(async (page = 1, perPage = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTicketHistory(page, perPage);
      console.log('Ticket history loaded:', data);
      setTickets(Array.isArray(data) ? data : (data?.data || []));
      return data;
    } catch (err) {
      setError('Không thể tải lịch sử đặt vé');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy chi tiết vé
  const loadTicketDetails = useCallback(async (ticketId) => {
    if (!ticketId) return null;
    
    setLoading(true);
    setError(null);
    try {
      const ticket = await fetchTicketDetails(ticketId);
      console.log('Ticket details loaded:', ticket);
      setCurrentTicket(ticket);
      return ticket;
    } catch (err) {
      setError('Không thể tải thông tin vé');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hủy vé
  const cancelBooking = useCallback(async (ticketId) => {
    if (!ticketId) return false;
    
    setLoading(true);
    setError(null);
    try {
      await cancelTicket(ticketId);
      console.log('Ticket canceled:', ticketId);
      // Reload ticket history after cancellation
      await loadTicketHistory();
      return true;
    } catch (err) {
      setError('Không thể hủy vé');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadTicketHistory]);

  // Lọc vé theo thời gian
  const filterTicketsByDate = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await filterTickets(filters);
      console.log('Filtered tickets:', data);
      setTickets(Array.isArray(data) ? data : (data?.data || []));
      return data;
    } catch (err) {
      setError('Không thể lọc vé');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra trạng thái thanh toán
  const checkPaymentStatusById = useCallback(async (ticketId) => {
    if (!ticketId) return null;
    
    setLoading(true);
    setError(null);
    try {
      const status = await checkPaymentStatus(ticketId);
      console.log('Payment status checked:', status);
      setPaymentStatus(status);
      return status;
    } catch (err) {
      setError('Không thể kiểm tra trạng thái thanh toán');
      console.error('Payment status check error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Xử lý callback từ VNPay
  const processVnpayCallback = useCallback(async (callbackData) => {
    if (!callbackData) return null;
    
    setLoading(true);
    setError(null);
    try {
      const result = await vnpayCallback(callbackData);
      console.log('VNPay callback processed:', result);
      
      // Cập nhật payment status nếu có ticket_id
      if (result?.ticket_id) {
        await checkPaymentStatusById(result.ticket_id);
      }
      
      return result;
    } catch (err) {
      setError('Không thể xử lý callback thanh toán');
      console.error('VNPay callback error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkPaymentStatusById]);

  // Clear booking data
  const clearBookingData = useCallback(() => {
    setBookingData(null);
    setError(null);
  }, []);

  // Clear current ticket
  const clearCurrentTicket = useCallback(() => {
    setCurrentTicket(null);
    setError(null);
  }, []);

  // Clear payment status
  const clearPaymentStatus = useCallback(() => {
    setPaymentStatus(null);
    setError(null);
  }, []);

  return {
    // Data states
    bookingData,
    tickets,
    currentTicket,
    paymentStatus,
    
    // Loading & Error states
    loading,
    error,
    
    // Functions
    createBooking,
    loadTicketHistory,
    loadTicketDetails,
    cancelBooking,
    filterTicketsByDate,
    checkPaymentStatusById,
    processVnpayCallback,
    clearBookingData,
    clearCurrentTicket,
    clearPaymentStatus,
    
    // Setters
    setError,
    setBookingData,
    setPaymentStatus
  };
};

export default useBooking2;