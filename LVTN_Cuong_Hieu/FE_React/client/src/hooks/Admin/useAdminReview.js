import { useState, useEffect } from 'react';
import { fetchReviews } from '../../services/ADMINS/apiAdminReviews';

export const useAdminReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  const loadReviews = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchReviews(page);
      
      // Handle Laravel pagination structure
      setReviews(data.data || []); // Laravel puts actual data in 'data' field
      setTotalPages(data.last_page || 1); // Laravel uses 'last_page'
      setTotalReviews(data.total || 0); // Laravel uses 'total'
      setCurrentPage(data.current_page || page); // Laravel uses 'current_page'
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load reviews on mount
  useEffect(() => {
    loadReviews(1);
  }, []);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      loadReviews(page);
    }
  };

  const refreshReviews = () => {
    loadReviews(currentPage);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return {
    reviews,
    loading,
    error,
    currentPage,
    totalPages,
    totalReviews,
    goToPage,
    nextPage,
    prevPage,
    refreshReviews,
    loadReviews
  };
};