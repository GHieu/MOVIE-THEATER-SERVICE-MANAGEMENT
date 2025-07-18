// services/apiBooking.js
import api from './api';

// Đặt vé
export const bookTicket = async (bookingData) => {
  try {
    // bookingData format:
    // {
    //   showtime_id: number,
    //   seats: ['A1', 'A2'], 
    //   services: [{ service_id: 1, quantity: 2 }]
    // }
    const response = await api.post('/tickets/book', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error booking ticket:', error);
    throw error;
  }
};

export const fetchTicketHistory = async () => {
  try {
    const response = await api.get('/tickets/history');


    return response.data;
    
  } catch (error) {
    console.error('Error fetching ticket history:', error);
        console.error('Status:', error.response?.status);
console.error('Data:', error.response?.data);
    throw error;
  }
};

// Lấy chi tiết vé
export const fetchTicketDetails = async (ticketId) => {
  try {
    const response = await api.get(`/ticket/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ticket ${ticketId}:`, error);
    throw error;
  }
};

// Hủy vé
export const cancelTicket = async (ticketId) => {
  try {
    const response = await api.delete(`/ticket/${ticketId}/cancel`);
    return response.data;
  } catch (error) {
    console.error(`Error canceling ticket ${ticketId}:`, error);
    throw error;
  }
};

// Lọc vé theo thời gian
export const filterTickets = async (filters) => {
  try {
    // filters format: { from_date: '2024-01-01', to_date: '2024-01-31' }
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/tickets/filter?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error filtering tickets:', error);
    throw error;
  }
};
export const checkPaymentStatus = async (ticketId) => {
  try {
    const response = await api.get(`/payment-status/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error(`Error checking payment status for ticket ${ticketId}:`, error);
    throw error;
  }
};
export const vnpayCallback = async (callbackData) => {
  try {
    const response = await api.get('/vnpay/callback', { params: callbackData });
    return response.data;
  } catch (error) {
    console.error('Error processing VNPay callback:', error);
    throw error;
  }
};
