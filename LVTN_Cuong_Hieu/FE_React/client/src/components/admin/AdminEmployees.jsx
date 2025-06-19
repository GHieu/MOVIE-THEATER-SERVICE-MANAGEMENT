import React, { useState } from 'react';
import useAdminEmployees from '../../hooks/Admin/useAdminEmployees';
import { Pencil, Search } from 'lucide-react';

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
  
  const employeeData = editingEmployee || newEmployee;

  const handleFormSubmit = async () => {
    if (editingEmployee) {
      await handleUpdateEmployee();
    } else {
      await handleAddEmployee();
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingEmployee(null);
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
            <input
              name="name"
              value={employeeData.name}
              onChange={handleInputChange}
              placeholder="Họ tên"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="phone"
              value={employeeData.phone}
              onChange={handleInputChange}
              placeholder="Số điện thoại"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="position"
              value={employeeData.position}
              onChange={handleInputChange}
              placeholder="Chức vụ"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              name="image"
              onChange={handleInputChange}
              accept="image/*"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <textarea
            name="description"
            value={employeeData.description}
            onChange={handleInputChange}
            placeholder="Mô tả"
            rows="3"
            className="w-full mt-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {editingEmployee ? 'Cập nhật' : 'Thêm'}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
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