import { useState, useEffect, useCallback } from 'react';
import { fetchTicketsHistory, filterTickets } from '../../services/ADMINS/apiAdminTicket';

export const useAdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [filters, setFilters] = useState({
    fromDate: null,
    toDate: null
  });

  // Lấy danh sách vé với phân trang
  const loadTickets = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchTicketsHistory(page);
      
      setTickets(response.data || []);
      setPagination({
        currentPage: response.current_page || page,
        totalPages: response.last_page || 1,
        totalItems: response.total || 0,
        itemsPerPage: response.per_page || 10
      });
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách vé');
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lọc vé theo thời gian
  const filterTicketsByDate = useCallback(async (fromDate = null, toDate = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await filterTickets(fromDate, toDate);
      
      setTickets(response || []);
      setFilters({ fromDate, toDate });
      
      // Reset pagination khi filter
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: response?.length || 0,
        itemsPerPage: response?.length || 0
      });
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lọc vé');
      console.error('Error filtering tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset filters và load lại danh sách ban đầu
  const clearFilters = useCallback(() => {
    setFilters({ fromDate: null, toDate: null });
    loadTickets(1);
  }, [loadTickets]);

  // Chuyển trang
  const changePage = useCallback((page) => {
    if (filters.fromDate || filters.toDate) {
      // Nếu đang filter thì không hỗ trợ phân trang
      return;
    }
    loadTickets(page);
  }, [loadTickets, filters]);

  // Refresh danh sách
  const refreshTickets = useCallback(() => {
    if (filters.fromDate || filters.toDate) {
      filterTicketsByDate(filters.fromDate, filters.toDate);
    } else {
      loadTickets(pagination.currentPage);
    }
  }, [loadTickets, filterTicketsByDate, filters, pagination.currentPage]);

  // Load tickets khi component mount
  useEffect(() => {
    loadTickets(1);
  }, [loadTickets]);

  return {
    // State
    tickets,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    loadTickets,
    filterTicketsByDate,
    clearFilters,
    changePage,
    refreshTickets
  };
};