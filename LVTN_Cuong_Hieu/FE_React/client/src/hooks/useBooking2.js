// hooks/useBooking.js
import { useState, useCallback } from 'react';
import { 
  bookTicket, 
  fetchTicketHistory, 
  fetchTicketDetails, 
  cancelTicket, 
  filterTickets 
} from '../services/apibooking';

const useBooking2 = () => {
  const [bookingData, setBookingData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Đặt vé
  const createBooking = useCallback(async (bookingInfo) => {
    setLoading(true);
    setError(null);
    try {
      // bookingInfo format:
      // {
      //   showtime_id: number,
      //   seats: ['A1', 'A2'],
      //   services: [{ service_id: 1, quantity: 2 }]
      // }
      const result = await bookTicket(bookingInfo);
      console.log('Booking created:', result);
      setBookingData(result);
      return result;
    } catch (err) {
      setError('Không thể đặt vé. Vui lòng thử lại.');
      console.error('Booking error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy lịch sử đặt vé
  const loadTicketHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTicketHistory();
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

  return {
    // Data states
    bookingData,
    tickets,
    currentTicket,
    
    // Loading & Error states
    loading,
    error,
    
    // Functions
    createBooking,
    loadTicketHistory,
    loadTicketDetails,
    cancelBooking,
    filterTicketsByDate,
    clearBookingData,
    clearCurrentTicket,
    
    // Setters
    setError,
    setBookingData
  };
};

export default useBooking2;