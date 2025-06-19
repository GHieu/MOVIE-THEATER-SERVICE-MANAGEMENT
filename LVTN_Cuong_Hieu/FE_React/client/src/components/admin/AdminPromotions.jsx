import React, { useState } from 'react';
import useAdminPromotion from '../../hooks/Admin/useAdminPromotions';
import { Trash2, Plus, X } from "lucide-react";

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
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount_percent: '',
        discount_amount: '',
        apply_to: '',
        start_date: '',
        end_date: '',
        status: 0
    });

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSubmit = async () => {
        // Validate form
        if (!formData.title || !formData.description || !formData.apply_to || !formData.start_date || !formData.end_date) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

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
            setShowForm(false);
        } catch (error) {
            console.error('Lỗi khi thêm khuyến mãi:', error);
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
        setShowForm(false);
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Thêm khuyến mãi mới</h3>
                            <button
                                onClick={handleCancel}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiêu đề *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập tiêu đề khuyến mãi"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập mô tả khuyến mãi"
                                />
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
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
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
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Áp dụng cho *
                                </label>
                                <input
                                    type="text"
                                    name="apply_to"
                                    value={formData.apply_to}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ví dụ: Tất cả vé xem phim"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày bắt đầu *
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày kết thúc *
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
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
                                    <option value={0}>Không hoạt động</option>
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
                                    type="button"
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    Thêm khuyến mãi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!loading && currentPromotions.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300">
                            <thead className="bg-gray-200 text-center">
                                <tr>
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
                                        <td className="border border-gray-300 p-2">{promo.title}</td>
                                        <td className="border border-gray-300 p-2">{promo.description}</td>
                                        <td className="border border-gray-300 p-2">{promo.discount_percent || 0}%</td>
                                        <td className="border border-gray-300 p-2">
                                            {promo.discount_amount ? promo.discount_amount.toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ'}
                                        </td>
                                        <td className="border border-gray-300 p-2">{promo.apply_to}</td>
                                        <td className="border border-gray-300 p-2">
                                            {promo.start_date ? new Date(promo.start_date).toLocaleDateString('vi-VN') : ''}
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            {promo.end_date ? new Date(promo.end_date).toLocaleDateString('vi-VN') : ''}
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                promo.status === 1 
                                                    ? 'bg-green-100 text-green-800' 
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