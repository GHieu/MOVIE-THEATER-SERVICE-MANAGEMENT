import { useState, useEffect, useCallback } from 'react';
import { getGiftHistoryWithFilters } from '../../services/ADMINS/apiAdminGiftHistory';

export const useAdminGiftHistory = () => {
  const [giftHistory, setGiftHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  const [filters, setFilters] = useState({
    customer: '',
    gift: '',
    from_date: '',
    to_date: '',
    page: 1
  });

  // Fetch gift history data
  const fetchGiftHistory = useCallback(async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getGiftHistoryWithFilters(filterParams);
      
      setGiftHistory(response.data || []);
      setPagination({
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
        per_page: response.per_page || 10,
        total: response.total || 0
      });
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error fetching gift history:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
  }, [filters]);

  // Change page
  const changePage = useCallback((page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchGiftHistory(updatedFilters);
  }, [filters, fetchGiftHistory]);

  // Search by customer
  const searchByCustomer = useCallback((customerName) => {
    updateFilters({ customer: customerName });
  }, [updateFilters]);

  // Search by gift
  const searchByGift = useCallback((giftName) => {
    updateFilters({ gift: giftName });
  }, [updateFilters]);

  // Filter by date range
  const filterByDateRange = useCallback((fromDate, toDate) => {
    updateFilters({ from_date: fromDate, to_date: toDate });
  }, [updateFilters]);

  // Clear filters
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      customer: '',
      gift: '',
      from_date: '',
      to_date: '',
      page: 1
    };
    setFilters(clearedFilters);
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    fetchGiftHistory();
  }, [fetchGiftHistory]);

  // Initial load and when filters change
  useEffect(() => {
    fetchGiftHistory();
  }, [filters]);

  return {
    // Data
    giftHistory,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    updateFilters,
    changePage,
    searchByCustomer,
    searchByGift,
    filterByDateRange,
    clearFilters,
    refresh,
    
    // Computed
    hasData: giftHistory.length > 0,
    isEmpty: !loading && giftHistory.length === 0,
    hasError: !!error
  };
};