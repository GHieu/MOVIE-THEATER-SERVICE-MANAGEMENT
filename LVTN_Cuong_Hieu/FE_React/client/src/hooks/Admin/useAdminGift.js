import { useState, useEffect, useCallback } from 'react';
import { fetchGifts, addGift, updateGift, deleteGift } from '../../services/ADMINS/apiAdminGift';

export const useAdminGift = () => {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGift, setSelectedGift] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit' | 'view'
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Base URL cho storage - giống như trong useMovies
  const BASE_URL = 'http://127.0.0.1:8000/storage/';

  // Validation helper
  const validateGiftData = (giftData, isEdit = false) => {
    const errors = {};

    // Validate name
    if (!giftData.name || giftData.name.trim().length === 0) {
      errors.name = 'Tên quà tặng là bắt buộc';
    } else if (giftData.name.trim().length < 2) {
      errors.name = 'Tên quà tặng phải có ít nhất 2 ký tự';
    } else if (giftData.name.trim().length > 255) {
      errors.name = 'Tên quà tặng không được vượt quá 255 ký tự';
    }

    // Validate description
    if (!giftData.description || giftData.description.trim().length === 0) {
      errors.description = 'Mô tả là bắt buộc';
    } else if (giftData.description.trim().length < 10) {
      errors.description = 'Mô tả phải có ít nhất 10 ký tự';
    } else if (giftData.description.trim().length > 1000) {
      errors.description = 'Mô tả không được vượt quá 1000 ký tự';
    }

    // Validate point_required
    const pointRequired = parseInt(giftData.point_required, 10);
    if (!giftData.point_required || isNaN(pointRequired)) {
      errors.point_required = 'Điểm yêu cầu là bắt buộc';
    } else if (pointRequired < 1) {
      errors.point_required = 'Điểm yêu cầu phải lớn hơn 0';
    } else if (pointRequired > 1000000) {
      errors.point_required = 'Điểm yêu cầu không được vượt quá 1,000,000';
    }

    // Validate stock
    const stock = parseInt(giftData.stock, 10);
    if (giftData.stock === '' || isNaN(stock)) {
      errors.stock = 'Số lượng tồn kho là bắt buộc';
    } else if (stock < 0) {
      errors.stock = 'Số lượng tồn kho không được âm';
    } else if (stock > 1000000) {
      errors.stock = 'Số lượng tồn kho không được vượt quá 1,000,000';
    }

    // Validate image (chỉ bắt buộc khi thêm mới)
    if (!isEdit && !giftData.image) {
      errors.image = 'Hình ảnh là bắt buộc';
    }

    // Validate image file type và size
    if (giftData.image instanceof File) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(giftData.image.type)) {
        errors.image = 'Chỉ chấp nhận file ảnh định dạng JPG, JPEG, PNG';
      } else if (giftData.image.size > 5 * 1024 * 1024) { // 5MB
        errors.image = 'Kích thước file ảnh không được vượt quá 5MB';
      }
    }

    // Validate promotion_id (optional)
    if (giftData.promotion_id && giftData.promotion_id !== '') {
      const promotionId = parseInt(giftData.promotion_id, 10);
      if (isNaN(promotionId) || promotionId < 1) {
        errors.promotion_id = 'ID khuyến mãi phải là số nguyên dương';
      }
    }

    return errors;
  };

  // Lấy danh sách quà tặng
  const loadGifts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGifts();
      
      // Cập nhật gifts với URL đầy đủ cho ảnh (tương tự như movies)
      const giftsWithUrls = Array.isArray(data) 
        ? data.map(gift => ({
            ...gift,
            // Thêm URL đầy đủ cho hình ảnh
            image: gift.image ? `${BASE_URL}${gift.image}` : null,
            
            // Lưu lại original data để dùng khi edit
            originalImage: gift.image,
          }))
        : [];
      
      setGifts(giftsWithUrls);
      setTotalItems(giftsWithUrls.length);
    } catch (err) {
      console.error('Load gifts error:', err.response?.data);
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || 'Không thể tải danh sách quà tặng';
      setError(errorMsg);
      setGifts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo FormData (tương tự như trong useMovies)
  const createFormData = (giftData) => {
    const formData = new FormData();

    // Thêm các trường text/number
    formData.append('name', giftData.name?.trim() || '');
    formData.append('description', giftData.description?.trim() || '');
    formData.append('point_required', parseInt(giftData.point_required, 10) || 0);
    formData.append('stock', parseInt(giftData.stock, 10) || 0);
    
    // Thêm promotion_id nếu có
    if (giftData.promotion_id && giftData.promotion_id !== '') {
      formData.append('promotion_id', parseInt(giftData.promotion_id, 10));
    }

    // Chỉ append file nếu user chọn file mới
    if (giftData.image instanceof File) {
      formData.append('image', giftData.image);
    }

    return formData;
  };

  // Thêm quà tặng mới
  const handleAddGift = async (giftData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate data
      const validationErrors = validateGiftData(giftData, false);
      if (Object.keys(validationErrors).length > 0) {
        const errorMessage = Object.values(validationErrors).join(', ');
        setError(errorMessage);
        return { success: false, message: errorMessage, errors: validationErrors };
      }
      
      const formData = createFormData(giftData);
      const response = await addGift(formData);
      
      console.log('Add gift response:', response);
      
      // Reload danh sách để cập nhật
      await loadGifts();
      setIsModalOpen(false);
      return { success: true, message: 'Thêm quà tặng thành công' };
    } catch (err) {
      console.error('Add gift error:', err.response?.data);
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || 'Không thể thêm quà tặng';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật quà tặng
  const handleUpdateGift = async (id, giftData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Updating gift with data:', giftData);
      
      // Validate data
      const validationErrors = validateGiftData(giftData, true);
      if (Object.keys(validationErrors).length > 0) {
        const errorMessage = Object.values(validationErrors).join(', ');
        setError(errorMessage);
        return { success: false, message: errorMessage, errors: validationErrors };
      }
      
      const formData = createFormData(giftData);
      const response = await updateGift(id, formData);
      
      console.log('Update gift response:', response);
      
      // Reload danh sách để cập nhật
      await loadGifts();
      setIsModalOpen(false);
      setSelectedGift(null);
      return { success: true, message: 'Cập nhật quà tặng thành công' };
    } catch (err) {
      console.error('Update gift error:', err.response?.data);
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || 'Không thể cập nhật quà tặng';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Xóa quà tặng
  const handleDeleteGift = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteGift(id);
      setGifts(prev => prev.filter(gift => gift.id !== id));
      setTotalItems(prev => prev - 1);
      
      // Điều chỉnh trang hiện tại nếu cần
      const newTotalPages = Math.ceil((totalItems - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      
      return { success: true, message: 'Xóa quà tặng thành công' };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể xóa quà tặng';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi input (tương tự như useMovies)
  const handleInputChange = (e, isEditing = false) => {
    const { name, value, type, checked, files } = e.target;

    let newValue;
    if (type === 'checkbox') {
      newValue = checked ? 1 : 0;
    } else if (type === 'file') {
      newValue = files[0];
    } else {
      newValue = value;
    }

    if (isEditing && selectedGift) {
      setSelectedGift(prev => ({ ...prev, [name]: newValue }));
    }
  };

  // Pagination functions
  const getPaginatedGifts = (gifts, page, itemsPerPage) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return gifts.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems, itemsPerPage) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Modal handlers
  const openAddModal = () => {
    setSelectedGift(null);
    setModalMode('add');
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (gift) => {
    setSelectedGift(gift);
    setModalMode('edit');
    setIsModalOpen(true);
    setError(null);
  };

  const openViewModal = (gift) => {
    setSelectedGift(gift);
    setModalMode('view');
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGift(null);
    setError(null);
  };

  // Load gifts khi component mount
  useEffect(() => {
    loadGifts();
  }, [loadGifts]);

  return {
    // State
    gifts,
    loading,
    error,
    selectedGift,
    isModalOpen,
    modalMode,
    
    // Pagination
    currentPage,
    itemsPerPage,
    totalItems,
    
    // Actions
    loadGifts,
    handleAddGift,
    handleUpdateGift,
    handleDeleteGift,
    handleInputChange,
    validateGiftData,
    
    // Pagination functions
    getPaginatedGifts,
    getTotalPages,
    handlePageChange,
    
    // Modal handlers
    openAddModal,
    openEditModal,
    openViewModal,
    closeModal,
    
    // Utilities
    setError,
    setSelectedGift,
    
    // Constants
    BASE_URL
  };
};