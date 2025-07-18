import { useEffect, useState, useRef } from 'react';
import {
  getPromotions,
  addPromotion,
  deletePromotion,
} from '../../services/ADMINS/apiAdminPromotion';

const useAdminPromotion = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const promotionsRef = useRef(promotions);

  useEffect(() => {
    promotionsRef.current = promotions;
  }, [promotions]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPromotions();
      setPromotions(data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách khuyến mãi:', err);
      setError('Không thể tải khuyến mãi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromotion = async (promotionData) => {
    try {
      setError('');

      if (!promotionData.title || !promotionData.description || 
          !promotionData.apply_to || !promotionData.start_date || 
          !promotionData.end_date) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      const startDate = new Date(promotionData.start_date);
      const endDate = new Date(promotionData.end_date);
      
      if (startDate >= endDate) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }

      if (promotionData.discount_percent && 
          (promotionData.discount_percent < 0 || promotionData.discount_percent > 100)) {
        throw new Error('Phần trăm giảm giá phải từ 0 đến 100');
      }

      if (promotionData.discount_amount && promotionData.discount_amount < 0) {
        throw new Error('Số tiền giảm giá không được âm');
      }

      if (!promotionData.discount_percent && !promotionData.discount_amount) {
        throw new Error('Vui lòng nhập ít nhất một trong hai: phần trăm giảm giá hoặc số tiền giảm giá');
      }

      const processedData = {
        ...promotionData,
        discount_percent: promotionData.discount_percent ? Number(promotionData.discount_percent) : 0,
        discount_amount: promotionData.discount_amount ? Number(promotionData.discount_amount) : 0,
        status: Number(promotionData.status) || 0
      };

      await addPromotion(processedData);
      await fetchPromotions();
      
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
      setError('');

      if (!id) {
        throw new Error('ID khuyến mãi không hợp lệ');
      }

      const confirmed = window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?');
      if (!confirmed) {
        return { success: false, message: 'Đã hủy xóa' };
      }

      await deletePromotion(id);
      await fetchPromotions();
      
      return { success: true, message: 'Xóa khuyến mãi thành công!' };
    } catch (err) {
      console.error('Lỗi khi xóa khuyến mãi:', err);
      const errorMessage = err.message || 'Không thể xóa khuyến mãi.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setError('');
  };

  const getPromotionById = (id) => {
    return promotions.find(promotion => promotion.id === id);
  };

  const getActivePromotions = () => {
    return promotions.filter(promotion => promotion.status === 1);
  };

  const getPromotionsByDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return promotions.filter(promotion => {
      const promoStart = new Date(promotion.start_date);
      const promoEnd = new Date(promotion.end_date);
      
      return promoStart <= end && promoEnd >= start;
    });
  };

  const isPromotionActive = (promotion) => {
    if (!promotion) return false;

    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);

    // So sánh chỉ ngày, bỏ qua giờ
    const isSameDay = (date1, date2) => {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    };

    // Kiểm tra nếu trong khoảng thời gian hợp lệ, bao gồm cả ngày end_date
    const isActive = now >= startDate && (isSameDay(now, endDate) || now < endDate);
    console.log(`Promotion ${promotion.id}: now=${now.toLocaleString()}, start=${startDate.toLocaleString()}, end=${endDate.toLocaleString()}, active=${isActive}`);
    return isActive;
  };

  useEffect(() => {
    const checkPromotionStatus = () => {
      const currentPromotions = promotionsRef.current;
      const updatedPromotions = currentPromotions.map(promo => {
        const isActive = isPromotionActive(promo);
        if (isActive && promo.status !== 1) {
          console.log(`Activating promotion ${promo.id}`);
          return { ...promo, status: 1 }; // Kích hoạt nếu trong khoảng thời gian
        } else if (!isActive && promo.status !== 0) {
          console.log(`Deactivating promotion ${promo.id}`);
          return { ...promo, status: 0 }; // Tắt nếu hết hạn
        }
        return promo;
      });

      if (JSON.stringify(updatedPromotions) !== JSON.stringify(currentPromotions)) {
        console.log('Updating promotions:', updatedPromotions);
        setPromotions(updatedPromotions);
      }
    };

    checkPromotionStatus(); // Kiểm tra ngay lập tức
    const intervalId = setInterval(checkPromotionStatus, 60000); // Kiểm tra mỗi 1 phút

    return () => clearInterval(intervalId);
  }, [promotions]);

  useEffect(() => {
    fetchPromotions();
  }, []);

  return {
    promotions,
    loading,
    error,
    
    handleAddPromotion,
    handleDeletePromotion,
    fetchPromotions,
    clearError,
    
    getPromotionById,
    getActivePromotions,
    getPromotionsByDateRange,
    isPromotionActive,
    
    totalPromotions: promotions.length,
    activePromotions: promotions.filter(p => p.status === 1).length,
    inactivePromotions: promotions.filter(p => p.status === 0).length,
  };
};

export default useAdminPromotion;