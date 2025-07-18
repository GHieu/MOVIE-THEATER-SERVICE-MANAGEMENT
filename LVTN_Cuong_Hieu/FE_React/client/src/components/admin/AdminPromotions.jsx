import React, { useState } from 'react';
import useAdminPromotion from '../../hooks/Admin/useAdminPromotions';
import { Trash2, Plus, X, Calendar } from "lucide-react";
import { DateRange } from 'react-date-range';
import { format, addDays, addYears, isAfter, isBefore } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminPromotion = () => {
    const {
        promotions,
        handleDeletePromotion,
        handleAddPromotion,
        loading,
        error,
    } = useAdminPromotion();

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    // Tính toán phân trang
    const totalPromotionsCount = promotions.length;
    const totalPages = Math.ceil(totalPromotionsCount / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPromotions = promotions.slice(startIndex, endIndex);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const [showForm, setShowForm] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    // State cho date range
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            key: 'selection'
        }
    ]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount_percent: '',
        discount_amount: '',
        apply_to: '',
        start_date: '',
        end_date: '',
        status: 1
    });

    // State cho validation errors
    const [validationErrors, setValidationErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
        
        // Xóa lỗi validation khi user nhập lại
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Xử lý thay đổi date range
    const handleDateRangeChange = (ranges) => {
        const { startDate, endDate } = ranges.selection;
        setDateRange([ranges.selection]);
        
        // Cập nhật formData với định dạng YYYY-MM-DD
        setFormData(prev => ({
            ...prev,
            start_date: format(startDate, 'yyyy-MM-dd'),
            end_date: format(endDate, 'yyyy-MM-dd')
        }));

        // Xóa lỗi validation cho date
        setValidationErrors(prev => ({
            ...prev,
            start_date: null,
            end_date: null
        }));
    };

    // Toggle date picker
    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    // Đóng date picker khi chọn xong
    const handleDatePickerClose = () => {
        setShowDatePicker(false);
    };

    const applyToMap = {
        ticket: 'Vé',
        service: 'Dịch vụ',
        gift: 'Quà tặng'
    };

    // Frontend validation function
    const validateForm = () => {
        const errors = {};
        
        // Title validation
        if (!formData.title || formData.title.trim() === '') {
            errors.title = 'Tiêu đề là bắt buộc';
        } else if (formData.title.length < 5) {
            errors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
        } else if (formData.title.length > 255) {
            errors.title = 'Tiêu đề không được quá 255 ký tự';
        } else if (!/^[a-zA-ZÀ-ỹ0-9\s\-]+$/.test(formData.title)) {
            errors.title = 'Tiêu đề chỉ được chứa chữ, số, khoảng trắng và dấu gạch ngang';
        }

        // Description validation
        if (!formData.description || formData.description.trim() === '') {
            errors.description = 'Mô tả là bắt buộc';
        } else if (formData.description.length < 10) {
            errors.description = 'Mô tả phải có ít nhất 10 ký tự';
        } else if (formData.description.length > 1000) {
            errors.description = 'Mô tả không được quá 1000 ký tự';
        }

        // Discount validation - CHỈ YÊU CẦU ÍT NHẤT 1 LOẠI
        if (!formData.discount_percent && !formData.discount_amount) {
            errors.discount_percent = 'Phải có ít nhất một loại giảm giá (% hoặc VNĐ)';
        }

        // Discount percent validation
        if (formData.discount_percent) {
            if (isNaN(formData.discount_percent)) {
                errors.discount_percent = 'Phần trăm giảm giá phải là số';
            } else if (formData.discount_percent < 0) {
                errors.discount_percent = 'Phần trăm giảm giá phải là số dương';
            } else if (formData.discount_percent > 100) {
                errors.discount_percent = 'Phần trăm giảm giá không được quá 100%';
            } else if (!/^\d+(\.\d{1,2})?$/.test(formData.discount_percent.toString())) {
                errors.discount_percent = 'Phần trăm giảm giá phải là số, tối đa 2 chữ số thập phân';
            }
        }

        // Discount amount validation
        if (formData.discount_amount) {
            if (isNaN(formData.discount_amount)) {
                errors.discount_amount = 'Số tiền giảm giá phải là số';
            } else if (formData.discount_amount < 0) {
                errors.discount_amount = 'Số tiền giảm giá phải là số dương';
            } else if (!/^\d+(\.\d{1,2})?$/.test(formData.discount_amount.toString())) {
                errors.discount_amount = 'Số tiền giảm giá phải là số, tối đa 2 chữ số thập phân';
            }
        }

        // Apply to validation
        if (!formData.apply_to) {
            errors.apply_to = 'Vui lòng chọn loại áp dụng';
        } else if (!['ticket', 'service', 'gift'].includes(formData.apply_to)) {
            errors.apply_to = 'Loại áp dụng không hợp lệ';
        }

        // Start date validation
        if (!formData.start_date) {
            errors.start_date = 'Ngày bắt đầu là bắt buộc';
        } else {
            const startDate = new Date(formData.start_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (isBefore(startDate, today)) {
                errors.start_date = 'Ngày bắt đầu phải từ hôm nay trở về sau';
            }
        }

        // End date validation
        if (!formData.end_date) {
            errors.end_date = 'Ngày kết thúc là bắt buộc';
        } else if (formData.start_date && formData.end_date) {
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);
            
            if (!isAfter(endDate, startDate)) {
                errors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
            }
        }

        return errors;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Reset validation errors
        setValidationErrors({});

        // Frontend validation
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        // ĐÃ BỎ KIỂM TRA ĐIỀU KIỆN: Chỉ được chọn một loại giảm giá
        // Bây giờ có thể nhập cả % và VNĐ

        try {
            await handleAddPromotion(formData);
            setFormData({
                title: '',
                description: '',
                discount_percent: '',
                discount_amount: '',
                apply_to: '',
                start_date: '',
                end_date: '',
                status: 0
            });
            setDateRange([{
                startDate: new Date(),
                endDate: addDays(new Date(), 7),
                key: 'selection'
            }]);
            setValidationErrors({});
            setShowForm(false);
            setShowDatePicker(false);
        } catch (error) {
            console.error('Lỗi khi thêm khuyến mãi:', error);
            
            // Handle API validation errors from backend
            if (error.response && error.response.data && error.response.data.errors) {
                setValidationErrors(error.response.data.errors);
            } else {
                alert('Có lỗi xảy ra khi thêm khuyến mãi. Vui lòng thử lại.');
            }
        }
    };

    const handleCancel = () => {
        setFormData({
            title: '',
            description: '',
            discount_percent: '',
            discount_amount: '',
            apply_to: '',
            start_date: '',
            end_date: '',
            status: 0
        });
        setDateRange([{
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            key: 'selection'
        }]);
        setValidationErrors({});
        setShowForm(false);
        setShowDatePicker(false);
    };

    // Helper function to render error message
    const renderError = (fieldName) => {
        const errorMessage = validationErrors[fieldName];
        if (errorMessage) {
            return (
                <p className="text-red-500 text-xs mt-1">
                    {Array.isArray(errorMessage) ? errorMessage[0] : errorMessage}
                </p>
            );
        }
        return null;
    };

    return (
        <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div>
                    <p className="font-semibold">Tổng khuyến mãi: {totalPromotionsCount}</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                    <Plus size={18} />
                    Thêm khuyến mãi
                </button>
            </div>

            <h2 className="text-xl font-bold mb-4">Quản lý khuyến mãi</h2>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {/* Form thêm khuyến mãi */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Thêm khuyến mãi mới</h3>
                            <button
                                onClick={handleCancel}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tiêu đề <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Nhập tiêu đề khuyến mãi (5-255 ký tự)"
                                    />
                                    {renderError('title')}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô tả <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows="3"
                                        className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Nhập mô tả khuyến mãi (10-1000 ký tự)"
                                    />
                                    {renderError('description')}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Giảm giá (%) 
                                        </label>
                                        <input
                                            type="number"
                                            name="discount_percent"
                                            value={formData.discount_percent}
                                            onChange={handleInputChange}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                validationErrors.discount_percent ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="0-100"
                                        />
                                        {renderError('discount_percent')}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Giảm giá (VNĐ) 
                                        </label>
                                        <input
                                            type="number"
                                            name="discount_amount"
                                            value={formData.discount_amount}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                validationErrors.discount_amount ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Số tiền giảm"
                                        />
                                        {renderError('discount_amount')}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Áp dụng cho <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="apply_to"
                                        value={formData.apply_to}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.apply_to ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Chọn loại</option>
                                        <option value="ticket">Vé</option>
                                        <option value="service">Dịch vụ</option>
                                        <option value="gift">Quà tặng</option>
                                    </select>
                                    {renderError('apply_to')}
                                </div>

                                {/* Date Range Picker */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Thời gian khuyến mãi <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={toggleDatePicker}
                                            className={`flex items-center gap-2 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                validationErrors.start_date || validationErrors.end_date ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        >
                                            <Calendar size={16} />
                                            <span className="text-left flex-1">
                                                {formData.start_date && formData.end_date ? (
                                                    `${format(new Date(formData.start_date), 'dd/MM/yyyy', { locale: vi })} - ${format(new Date(formData.end_date), 'dd/MM/yyyy', { locale: vi })}`
                                                ) : (
                                                    'Chọn khoảng thời gian'
                                                )}
                                            </span>
                                        </button>
                                    </div>
                                    {renderError('start_date')}
                                    {renderError('end_date')}

                                    {/* Date Range Picker Modal */}
                                    {showDatePicker && (
                                        <div className="absolute top-full left-0 z-50 mt-2 bg-white border border-gray-300 rounded shadow-lg">
                                            <div className="p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-sm font-medium">Chọn thời gian khuyến mãi</h4>
                                                    <button
                                                        type="button"
                                                        onClick={handleDatePickerClose}
                                                        className="text-gray-500 hover:text-gray-700"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                <DateRange
                                                    ranges={dateRange}
                                                    onChange={handleDateRangeChange}
                                                    locale={vi}
                                                    minDate={new Date()}
                                                    maxDate={addYears(new Date(), 2)}
                                                    rangeColors={['#3b82f6']}
                                                    showDateDisplay={false}
                                                    showMonthAndYearPickers={true}
                                                    months={1}
                                                    direction="horizontal"
                                                    className="border-0"
                                                />
                                                <div className="flex justify-end mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleDatePickerClose}
                                                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        Xác nhận
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Trạng thái
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        
                                        <option value={1}>Hoạt động</option>
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Thêm khuyến mãi
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {!loading && currentPromotions.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300">
                            <thead className="bg-gray-200 text-center">
                                <tr>
                                    <th className="border border-gray-300 p-2">Mã khuyến mãi</th>
                                    <th className="border border-gray-300 p-2">Tiêu đề</th>
                                    <th className="border border-gray-300 p-2">Mô tả</th>
                                    <th className="border border-gray-300 p-2">Giảm (%)</th>
                                    <th className="border border-gray-300 p-2">Giảm (VNĐ)</th>
                                    <th className="border border-gray-300 p-2">Áp dụng cho</th>
                                    <th className="border border-gray-300 p-2">Ngày bắt đầu</th>
                                    <th className="border border-gray-300 p-2">Ngày kết thúc</th>
                                    <th className="border border-gray-300 p-2">Trạng thái</th>
                                    <th className="border border-gray-300 p-2">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {currentPromotions.map((promo) => (
                                    <tr key={promo.id} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-2">{promo.id}</td>
                                        <td className="border border-gray-300 p-2">{promo.title}</td>
                                        <td className="border border-gray-300 p-2">{promo.description}</td>
                                        <td className="border border-gray-300 p-2">{promo.discount_percent || 0}%</td>
                                        <td className="border border-gray-300 p-2">
                                            {promo.discount_amount ? promo.discount_amount.toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ'}
                                        </td>
                                        <td className="border border-gray-300 p-2">{applyToMap[promo.apply_to]}</td>
                                        <td className="border border-gray-300 p-2">
                                            {promo.start_date ? format(new Date(promo.start_date), 'dd/MM/yyyy', { locale: vi }) : ''}
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            {promo.end_date ? format(new Date(promo.end_date), 'dd/MM/yyyy', { locale: vi }) : ''}
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <span className={`px-2 py-1 rounded-md text-xs ${
                                                promo.status === 1 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {promo.status === 1 ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <button
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                onClick={() => handleDeletePromotion(promo.id)}
                                                title="Xóa khuyến mãi"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-4 space-x-2">
                            <button
                                className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                &laquo;
                            </button>

                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    className={`px-3 py-1 border rounded ${
                                        currentPage === index + 1
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                    onClick={() => goToPage(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
                                className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                &raquo;
                            </button>
                        </div>
                    )}
                </>
            ) : !loading && promotions.length === 0 ? (
                <div className="text-center text-gray-600 mt-8">
                    <p>Không có khuyến mãi nào.</p>
                    <p className="text-sm mt-2">Nhấn nút "Thêm khuyến mãi" để tạo khuyến mãi mới.</p>
                </div>
            ) : loading ? (
                <div className="text-center text-gray-600 mt-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <p className="mt-2">Đang tải...</p>
                </div>
            ) : null}
        </div>
    );
};

export default AdminPromotion;