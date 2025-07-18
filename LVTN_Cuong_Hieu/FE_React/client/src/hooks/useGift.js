import { useState, useEffect } from 'react';
import { getGifts, exchangeGift } from '../services/apiGift';

// Định nghĩa BASE_URL
const BASE_URL = 'http://127.0.0.1:8000/storage/';

export const useGifts = () => {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);

  // Lấy danh sách quà tặng và xử lý URL hình ảnh
  const fetchGifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGifts();
      // Thêm URL hình ảnh đầy đủ vào mỗi quà tặng
      const giftsWithImageUrls = data.map(gift => ({
        ...gift,
        imageUrl: gift.image ? `${BASE_URL}${gift.image}` : null // Giả sử 'image' là thuộc tính chứa tên file hoặc đường dẫn
      }));
      setGifts(giftsWithImageUrls);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách quà tặng');
    } finally {
      setLoading(false);
    }
  };

  // Đổi quà tặng
  const handleExchangeGift = async (giftId) => {
    try {
      setExchangeLoading(true);
      setError(null);
      const result = await exchangeGift(giftId);
      
      // Cập nhật lại danh sách sau khi đổi thành công
      await fetchGifts();
      
      return {
        success: true,
        message: result.message,
        history: result.history
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi đổi quà';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setExchangeLoading(false);
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchGifts();
  }, []);

  return {
    gifts, // Danh sách quà tặng đã bao gồm imageUrl
    loading,
    error,
    exchangeLoading,
    fetchGifts,
    exchangeGift: handleExchangeGift,
    refetch: fetchGifts
  };
};