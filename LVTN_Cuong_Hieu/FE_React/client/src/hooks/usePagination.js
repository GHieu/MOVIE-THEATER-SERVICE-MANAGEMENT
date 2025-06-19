import { useState, useEffect, useMemo, useCallback } from 'react';

export default function usePagination(data = [], itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [dataToUse, setDataToUse] = useState([]);

  // Initialize data
  useEffect(() => {
    if (Array.isArray(data)) {
      setDataToUse(data);
    }
  }, [data]);

  const totalPages = useMemo(() => {
    if (!Array.isArray(dataToUse) || dataToUse.length === 0) return 1;
    return Math.ceil(dataToUse.length / itemsPerPage);
  }, [dataToUse, itemsPerPage]);

  const paginatedData = useMemo(() => {
    if (!Array.isArray(dataToUse)) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const result = dataToUse.slice(startIndex, endIndex);
    
    console.log('Pagination Debug:', {
      currentPage,
      totalPages,
      dataLength: dataToUse.length,
      startIndex,
      endIndex,
      resultLength: result.length,
      itemsPerPage
    });
    
    return result;
  }, [dataToUse, currentPage, itemsPerPage, totalPages]);

  const goToPage = useCallback((page) => {
    const pageNum = parseInt(page);
    console.log('goToPage called:', { page, pageNum, totalPages, currentPage });
    
    if (pageNum >= 1 && pageNum <= totalPages && pageNum !== currentPage) {
      setCurrentPage(pageNum);
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages, currentPage]);

  const nextPage = useCallback(() => {
    console.log('nextPage called:', { currentPage, totalPages });
    if (currentPage < totalPages) {
      setCurrentPage(prev => {
        const newPage = prev + 1;
        console.log('Setting page to:', newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return newPage;
      });
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    console.log('prevPage called:', { currentPage });
    if (currentPage > 1) {
      setCurrentPage(prev => {
        const newPage = prev - 1;
        console.log('Setting page to:', newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return newPage;
      });
    }
  }, [currentPage]);

  const setData = useCallback((newData) => {
    console.log('setData called:', { newData: newData?.length || 0 });
    if (Array.isArray(newData)) {
      setDataToUse(newData);
      setCurrentPage(1); // Reset to first page when data changes
    }
  }, []);

  // Reset page when data changes but currentPage is invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      console.log('Resetting page due to invalid currentPage:', { currentPage, totalPages });
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    setData,
    hasNext,
    hasPrev,
    // Debug info
    totalItems: dataToUse.length,
    itemsPerPage
  };
}