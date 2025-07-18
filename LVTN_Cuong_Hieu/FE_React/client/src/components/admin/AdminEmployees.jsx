import React, { useState } from 'react';
import useAdminEmployees from '../../hooks/Admin/useAdminEmployees';
import { Pencil, Search, AlertCircle } from 'lucide-react';

const AdminEmployees = () => {
  const {
    employees,
    newEmployee,
    editingEmployee,
    loading,
    error,

    // Pagination
    currentPage,
    totalPages,
    totalEmployees,
    perPage,
    goToPage,

    // Search
    searchQuery,
    setSearchQuery,

    setNewEmployee,
    setEditingEmployee,
    handleAddEmployee,
    handleUpdateEmployee,
    handleInputChange
  } = useAdminEmployees();

  const [isAdding, setIsAdding] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const employeeData = editingEmployee || newEmployee;

  // Validation functions
  const validateName = (name) => {
    const errors = [];
    if (!name || name.trim().length === 0) {
      errors.push('Họ tên là bắt buộc');
    } else if (name.trim().length < 3) {
      errors.push('Họ tên phải có ít nhất 3 ký tự');
    } else if (name.trim().length > 255) {
      errors.push('Họ tên không được vượt quá 255 ký tự');
    } else if (!/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềếểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s\-\.]+$/.test(name.trim())) {
      errors.push('Họ tên chỉ được chứa chữ cái, khoảng trắng, dấu gạch ngang và dấu chấm');
    }
    return errors;
  };

  const validatePhone = (phone) => {
    const errors = [];
    if (!phone || phone.trim().length === 0) {
      errors.push('Số điện thoại là bắt buộc');
    } else if (phone.trim().length < 8) {
      errors.push('Số điện thoại phải có ít nhất 8 ký tự');
    } else if (phone.trim().length > 20) {
      errors.push('Số điện thoại không được vượt quá 20 ký tự');
    } else if (!/^(0|\+84)[0-9]{8,19}$/.test(phone.trim())) {
      errors.push('Số điện thoại phải có định dạng hợp lệ (bắt đầu bằng 0 hoặc +84)');
    }
    return errors;
  };

  const validatePosition = (position) => {
    const errors = [];
    if (!position || position.trim().length === 0) {
      errors.push('Chức vụ là bắt buộc');
    } else if (position.trim().length < 3) {
      errors.push('Chức vụ phải có ít nhất 3 ký tự');
    } else if (position.trim().length > 255) {
      errors.push('Chức vụ không được vượt quá 255 ký tự');
    }
    return errors;
  };

  const validateDescription = (description) => {
    const errors = [];
    if (description && description.trim().length > 1000) {
      errors.push('Mô tả không được vượt quá 1000 ký tự');
    }
    return errors;
  };

  const validateImage = (image) => {
    const errors = [];
    if (!editingEmployee && (!image || !image.name)) {
      errors.push('Ảnh là bắt buộc');
    } else if (image && image.name) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 2048 * 1024; // 2MB

      if (!allowedTypes.includes(image.type)) {
        errors.push('Chỉ chấp nhận file ảnh định dạng JPEG, PNG, JPG');
      }
      if (image.size > maxSize) {
        errors.push('Kích thước ảnh không được vượt quá 2MB');
      }
    }
    return errors;
  };

  const validateForm = () => {
    const errors = {};
    
    const nameErrors = validateName(employeeData.name);
    if (nameErrors.length > 0) errors.name = nameErrors;

    const phoneErrors = validatePhone(employeeData.phone);
    if (phoneErrors.length > 0) errors.phone = phoneErrors;

    const positionErrors = validatePosition(employeeData.position);
    if (positionErrors.length > 0) errors.position = positionErrors;

    const descriptionErrors = validateDescription(employeeData.description);
    if (descriptionErrors.length > 0) errors.description = descriptionErrors;

    const imageErrors = validateImage(employeeData.image);
    if (imageErrors.length > 0) errors.image = imageErrors;

    return errors;
  };

  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    
    // Validate form
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }

    // Clear errors if validation passes
    setValidationErrors({});

    try {
      if (editingEmployee) {
        await handleUpdateEmployee();
      } else {
        await handleAddEmployee();
        setIsAdding(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle API errors here if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingEmployee(null);
    setValidationErrors({});
    setNewEmployee({
      name: '',
      phone: '',
      position: '',
      description: '',
      image: ''
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localSearchQuery);
  };

  const handleSearchClear = () => {
    setLocalSearchQuery('');
    setSearchQuery('');
  };

  // Clear validation error when user starts typing
  const handleInputChangeWithValidation = (e) => {
    const { name } = e.target;
    
    // Clear error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Call original handler
    handleInputChange(e);
  };

  // Tạo array số trang để hiển thị pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const ErrorMessage = ({ errors }) => {
    if (!errors || errors.length === 0) return null;
    
    return (
      <div className="mt-1 text-sm text-red-600">
        {errors.map((error, index) => (
          <div key={index} className="flex items-center gap-1">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý nhân viên</h2>
        <button
          className="bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700"
          onClick={() => {
            setIsAdding(true);
            setEditingEmployee(null);
            setValidationErrors({});
          }}
        >
          Thêm nhân viên
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên nhân viên..."
              className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tìm kiếm
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Xóa
            </button>
          )}
        </form>
      </div>

      {/* Form thêm / cập nhật */}
      {(isAdding || editingEmployee) && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
          <h3 className="text-lg font-semibold mb-3">
            {editingEmployee ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên */}
            <div>
              <input
                name="name"
                value={employeeData.name}
                onChange={handleInputChangeWithValidation}
                placeholder="Họ tên *"
                className={`p-2 border rounded-lg w-full focus:outline-none focus:ring-2 ${
                  validationErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <ErrorMessage errors={validationErrors.name} />
            </div>

            {/* Số điện thoại */}
            <div>
              <input
                name="phone"
                value={employeeData.phone}
                onChange={handleInputChangeWithValidation}
                placeholder="Số điện thoại *"
                className={`p-2 border rounded-lg w-full focus:outline-none focus:ring-2 ${
                  validationErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <ErrorMessage errors={validationErrors.phone} />
            </div>

            {/* Chức vụ */}
            <div>
              <input
                name="position"
                value={employeeData.position}
                onChange={handleInputChangeWithValidation}
                placeholder="Chức vụ *"
                className={`p-2 border rounded-lg w-full focus:outline-none focus:ring-2 ${
                  validationErrors.position ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <ErrorMessage errors={validationErrors.position} />
            </div>

            {/* Ảnh */}
            <div>
              <input
                type="file"
                name="image"
                onChange={handleInputChangeWithValidation}
                accept="image/jpeg,image/png,image/jpg"
                className={`p-2 border rounded-lg w-full focus:outline-none focus:ring-2 ${
                  validationErrors.image ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <ErrorMessage errors={validationErrors.image} />
            </div>
          </div>

          {/* Mô tả */}
          <div className="mt-4">
            <textarea
              name="description"
              value={employeeData.description}
              onChange={handleInputChangeWithValidation}
              placeholder="Mô tả"
              rows="3"
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                validationErrors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            <ErrorMessage errors={validationErrors.description} />
          </div>

          {/* Preview hình ảnh */}
          {(employeeData.image && typeof employeeData.image === 'string') && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
              <img
                src={employeeData.image}
                alt="Ảnh nhân viên"
                className="h-24 w-24 object-cover rounded-lg border"
              />
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {editingEmployee ? 'Cập nhật' : 'Thêm'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Thông tin phân trang */}
      <div className="mb-4 text-sm text-gray-600">
        Hiển thị {employees.length > 0 ? ((currentPage - 1) * perPage + 1) : 0} - {Math.min(currentPage * perPage, totalEmployees)} 
        trong tổng số {totalEmployees} nhân viên
        {searchQuery && (
          <span className="ml-2 text-blue-600">
            (Tìm kiếm: "{searchQuery}")
          </span>
        )}
      </div>

      {/* Danh sách nhân viên */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      ) : employees.length > 0 ? (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 p-3 text-left">Ảnh</th>
                  <th className="border border-gray-200 p-3 text-left">Họ tên</th>
                  <th className="border border-gray-200 p-3 text-left">SĐT</th>
                  <th className="border border-gray-200 p-3 text-left">Chức vụ</th>
                  <th className="border border-gray-200 p-3 text-left">Mô tả</th>
                  <th className="border border-gray-200 p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-3">
                      {emp.image ? (
                        <img
                          src={emp.image}
                          alt={emp.name}
                          className="h-12 w-12 object-cover rounded-full"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-200 p-3 font-medium">{emp.name}</td>
                    <td className="border border-gray-200 p-3">{emp.phone}</td>
                    <td className="border border-gray-200 p-3">{emp.position}</td>
                    <td className="border border-gray-200 p-3">
                      <div className="max-w-xs truncate" title={emp.description}>
                        {emp.description}
                      </div>
                    </td>
                    <td className="border border-gray-200 p-3 text-center">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        onClick={() => {
                          setEditingEmployee(emp);
                          setIsAdding(false);
                          setValidationErrors({});
                        }}
                        title="Chỉnh sửa"
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
              <button
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                Đầu
              </button>
              
              <button
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>

              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  className={`px-3 py-2 border rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>

              <button
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Cuối
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {searchQuery ? 'Không tìm thấy nhân viên nào' : 'Chưa có nhân viên nào'}
          </p>
          {searchQuery && (
            <button
              onClick={handleSearchClear}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;