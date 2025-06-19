// src/hooks/useAdminPromotion.js
import { useEffect, useState } from 'react';
import {
  getPromotions,
  addPromotion,
  deletePromotion,
} from '../../services/ADMINS/apiAdminPromotion';

const useAdminPromotion = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const data = await getPromotions();
      setPromotions(data); // data là mảng []
    } catch (err) {
      console.error('Lỗi khi lấy danh sách khuyến mãi:', err);
      setError('Không thể tải khuyến mãi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromotion = async (promotionData) => {
    try {
      setError(''); // Clear previous errors
      
      // Validate required fields
      if (!promotionData.title || !promotionData.description || 
          !promotionData.apply_to || !promotionData.start_date || 
          !promotionData.end_date) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      // Validate dates
      const startDate = new Date(promotionData.start_date);
      const endDate = new Date(promotionData.end_date);
      
      if (startDate >= endDate) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }

      // Validate discount values
      if (promotionData.discount_percent && 
          (promotionData.discount_percent < 0 || promotionData.discount_percent > 100)) {
        throw new Error('Phần trăm giảm giá phải từ 0 đến 100');
      }

      if (promotionData.discount_amount && promotionData.discount_amount < 0) {
        throw new Error('Số tiền giảm giá không được âm');
      }

      // Ensure at least one discount method is provided
      if (!promotionData.discount_percent && !promotionData.discount_amount) {
        throw new Error('Vui lòng nhập ít nhất một trong hai: phần trăm giảm giá hoặc số tiền giảm giá');
      }

      // Convert empty strings to null/0 for numeric fields
      const processedData = {
        ...promotionData,
        discount_percent: promotionData.discount_percent ? Number(promotionData.discount_percent) : 0,
        discount_amount: promotionData.discount_amount ? Number(promotionData.discount_amount) : 0,
        status: Number(promotionData.status) || 0
      };

      await addPromotion(processedData);
      await fetchPromotions(); // Refresh the list
      
      return { success: true, message: 'Thêm khuyến mãi thành công!' };
    } catch (err) {
      console.error('Lỗi khi thêm khuyến mãi:', err);
      const errorMessage = err.message || 'Không thể thêm khuyến mãi.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleDeletePromotion = async (id) => {
    try {
      setError(''); // Clear previous errors
      
      if (!id) {
        throw new Error('ID khuyến mãi không hợp lệ');
      }

      // Confirm deletion
      const confirmed = window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?');
      if (!confirmed) {
        return { success: false, message: 'Đã hủy xóa' };
      }

      await deletePromotion(id);
      await fetchPromotions(); // Refresh the list
      
      return { success: true, message: 'Xóa khuyến mãi thành công!' };
    } catch (err) {
      console.error('Lỗi khi xóa khuyến mãi:', err);
      const errorMessage = err.message || 'Không thể xóa khuyến mãi.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Helper function to clear errors
  const clearError = () => {
    setError('');
  };

  // Helper function to get promotion by ID
  const getPromotionById = (id) => {
    return promotions.find(promotion => promotion.id === id);
  };

  // Helper function to get active promotions
  const getActivePromotions = () => {
    return promotions.filter(promotion => promotion.status === 1);
  };

  // Helper function to get promotions by date range
  const getPromotionsByDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return promotions.filter(promotion => {
      const promoStart = new Date(promotion.start_date);
      const promoEnd = new Date(promotion.end_date);
      
      return promoStart <= end && promoEnd >= start;
    });
  };

  // Helper function to check if promotion is currently active
  const isPromotionActive = (promotion) => {
    if (promotion.status !== 1) return false;
    
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    
    return now >= startDate && now <= endDate;
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return {
    // Data
    promotions,
    loading,
    error,
    
    // Actions
    handleAddPromotion,
    handleDeletePromotion,
    fetchPromotions,
    clearError,
    
    // Helper functions
    getPromotionById,
    getActivePromotions,
    getPromotionsByDateRange,
    isPromotionActive,
    
    // Computed values
    totalPromotions: promotions.length,
    activePromotions: promotions.filter(p => p.status === 1).length,
    inactivePromotions: promotions.filter(p => p.status === 0).length,
  };
};

export default useAdminPromotion;