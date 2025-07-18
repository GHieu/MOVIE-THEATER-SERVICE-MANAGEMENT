import React, { useState } from 'react';
import useAdminBlog from '../../hooks/Admin/useAdminBlogs';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';

const AdminBlog = () => {
  const {
    blogs,
    currentPage,
    totalPages,
    totalBlogs,
    perPage,
    goToPage,
    searchQuery,
    setSearchQuery,
    formData,
    editingId,
    loading,
    error,
    handleInputChange,
    handleAddBlog,
    handleUpdateBlog,
    handleDeleteBlog,
    handleEditBlog,
    resetForm,
  } = useAdminBlog();

  const [isAdding, setIsAdding] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const isEditing = Boolean(editingId);
  const blogData = formData;

  // Validation functions
  const validateAdminId = (value) => {
    if (!value || value.toString().trim() === '') {
      return 'ID Admin là bắt buộc';
    }
    if (!/^\d+$/.test(value.toString())) {
      return 'ID Admin phải là số nguyên';
    }
    const numValue = parseInt(value);
    if (numValue < 1) {
      return 'ID Admin phải là số dương';
    }
    return '';
  };

  const validateTitle = (value) => {
    if (!value || value.trim() === '') {
      return 'Tiêu đề là bắt buộc';
    }
    if (value.length < 5) {
      return 'Tiêu đề phải có ít nhất 5 ký tự';
    }
    if (value.length > 100) {
      return 'Tiêu đề không được vượt quá 100 ký tự';
    }
    
    // Option 1: More permissive regex (allows most characters including Vietnamese)
    const titleRegex = /^[\p{L}\p{N}\s\.,!?\-]+$/u;
    
    // Option 2: Alternative approach - check for forbidden characters instead
    // const forbiddenChars = /[<>{}[\]\\\/^`~|@#$%&*()+=;:"']/;
    // if (forbiddenChars.test(value)) {
    //   return 'Tiêu đề chứa ký tự không được phép';
    // }
    
    if (!titleRegex.test(value)) {
      return 'Tiêu đề chỉ được chứa chữ cái, số, khoảng trắng và các ký tự . , ! ? -';
    }
    return '';
  };

  const validateContent = (value) => {
    if (!value || value.trim() === '') {
      return 'Nội dung là bắt buộc';
    }
    if (value.length < 10) {
      return 'Nội dung phải có ít nhất 10 ký tự';
    }
    return '';
  };

  const validateImage = (file, isRequired = false) => {
    if (!file && isRequired) {
      return 'Ảnh là bắt buộc';
    }
    if (file && typeof file === 'object' && file.type) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        return 'Chỉ cho phép file ảnh định dạng JPEG, PNG, JPG';
      }
      
    }
    return '';
  };

  // Validate all fields
  const validateForm = () => {
    const errors = {};
    
    errors.admin_id = validateAdminId(blogData.admin_id);
    errors.title = validateTitle(blogData.title);
    errors.content = validateContent(blogData.content);
    
    // Chỉ bắt buộc ảnh khi thêm mới
    const isImageRequired = !isEditing;
    errors.image = validateImage(blogData.image, isImageRequired);
    
    // Loại bỏ các error rỗng
    Object.keys(errors).forEach(key => {
      if (!errors[key]) {
        delete errors[key];
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced input change handler with validation
  const handleInputChangeWithValidation = (e) => {
    handleInputChange(e);
    
    // Clear specific field error khi user bắt đầu nhập
    const { name } = e.target;
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form trước khi submit
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingId) {
        await handleUpdateBlog();
      } else {
        await handleAddBlog();
        setIsAdding(false);
      }
      // Clear validation errors sau khi submit thành công
      setValidationErrors({});
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    resetForm();
    setValidationErrors({});
  };

  // Helper function để tạo array số trang cho pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý Blog</h2>
        <div className="flex items-center gap-4">
          <button
            className="bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700 transition-colors"
            onClick={() => {
              setIsAdding(true);
              resetForm();
              setValidationErrors({});
            }}
          >
            Thêm Blog
          </button>
          <span className="font-semibold">
            Tổng blog: {totalBlogs} | Trang {currentPage}/{totalPages}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tiêu đề..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}

      {/* Form thêm / sửa với validation */}
      {(isAdding || editingId) && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Sửa Blog' : 'Thêm Blog Mới'}
          </h3>
          
          <div className="space-y-4">
            {/* Admin ID với validation */}
            <div>
              <label className="block text-sm font-medium mb-1">
                ID Admin <span className="text-red-500">*</span>
              </label>
              <input
                name="admin_id"
                type="number"
                value={blogData.admin_id}
                onChange={handleInputChangeWithValidation}
                placeholder="ID Admin"
                className={`p-2 border w-full rounded focus:outline-none focus:ring-2 ${
                  validationErrors.admin_id 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                min="1"
              />
              {validationErrors.admin_id && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {validationErrors.admin_id}
                </p>
              )}
            </div>

            {/* Title với validation */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={blogData.title}
                onChange={handleInputChangeWithValidation}
                placeholder="Tiêu đề"
                className={`p-2 border w-full rounded focus:outline-none focus:ring-2 ${
                  validationErrors.title 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                maxLength="100"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{blogData.title.length}/100 ký tự</span>
                {validationErrors.title && (
                  <span className="text-red-500 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {validationErrors.title}
                  </span>
                )}
              </div>
            </div>

            {/* Content với validation */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={blogData.content}
                onChange={handleInputChangeWithValidation}
                placeholder="Nội dung"
                className={`p-2 border w-full rounded focus:outline-none focus:ring-2 ${
                  validationErrors.content 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                rows={4}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{blogData.content.length} ký tự</span>
                {validationErrors.content && (
                  <span className="text-red-500 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {validationErrors.content}
                  </span>
                )}
              </div>
            </div>

            {/* Image với validation */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Ảnh blog {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <input
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleInputChangeWithValidation}
                className={`p-2 border w-full rounded focus:outline-none focus:ring-2 ${
                  validationErrors.image 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <p className="text-sm text-gray-500 mt-1">
                Chỉ chấp nhận file JPEG, PNG, JPG.
              </p>
              {validationErrors.image && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {validationErrors.image}
                </p>
              )}
              
              {/* Preview ảnh */}
              {blogData.image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Preview:</p>
                  {typeof blogData.image === 'string' ? (
                    <img src={blogData.image} alt="Preview" className="w-32 h-20 object-cover mt-2 rounded" />
                  ) : (
                    <img 
                      src={URL.createObjectURL(blogData.image)} 
                      alt="Preview" 
                      className="w-32 h-20 object-cover mt-2 rounded" 
                    />
                  )}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={handleFormSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {isEditing ? 'Cập nhật' : 'Thêm'}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách blog */}
      {!loading && blogs.length > 0 ? (
        <>
          <table className="w-full border">
            <thead className="bg-gray-200 text-center">
              <tr>
                <th className="border p-2">Admin</th>
                <th className="border p-2">ID</th>
                <th className="border p-2">Tiêu đề</th>
                <th className="border p-2">Nội dung</th>
                <th className="border p-2">Ảnh</th>
                <th className="border p-2">Hành động</th>
              </tr>
            </thead>
            <tbody className='text-center'>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="border p-2">{blog.admin?.name || 'N/A'}</td>
                  <td className="border p-2">{blog.id}</td>
                  <td className="border p-2">{blog.title}</td>
                  <td className="border p-2 truncate max-w-xs">{blog.content}</td>
                  <td className="border p-2 text-center">
                    {blog.image && (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-20 h-auto mx-auto rounded shadow"
                      />
                    )}
                  </td>
                  <td className="border p-2 space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => {
                        handleEditBlog(blog);
                        setIsAdding(false);
                        setValidationErrors({});
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn xóa blog này?')) {
                          handleDeleteBlog(blog.id);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* API Pagination */}
          <div className="flex justify-center items-center mt-4 gap-2">
            <button
              className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo; Trước
            </button>

            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                className={`px-3 py-1 border rounded ${
                  page === currentPage 
                    ? 'bg-blue-600 text-white' 
                    : page === '...' 
                      ? 'bg-white cursor-default' 
                      : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => typeof page === 'number' && goToPage(page)}
                disabled={page === '...' || page === currentPage}
              >
                {page}
              </button>
            ))}

            <button
              className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau &raquo;
            </button>
          </div>

          {/* Pagination Info */}
          <div className="text-center mt-2 text-sm text-gray-600">
            Hiển thị {Math.min((currentPage - 1) * perPage + 1, totalBlogs)}-{Math.min(currentPage * perPage, totalBlogs)} 
            {' '}trong tổng số {totalBlogs} blogs
          </div>
        </>
      ) : loading ? (
        <p className="text-center text-gray-600 mt-4">Đang tải...</p>
      ) : (
        <p className="text-center text-gray-600 mt-4">Không có blog nào.</p>
      )}
    </div>
  );
};

export default AdminBlog;