import React, { useState, useEffect } from 'react';
import { Search, SortAsc, X } from 'lucide-react';
import { useAdminCustomers } from '../../hooks/Admin/useAdminCus';

const AdminCus = () => {
  const {
    customers,
    customerDetail,
    ticketHistory,
    reviewHistory,
    statistics,
    loading,
    error,
    pagination,
    getCustomers,
    getCustomerDetail,
    updateCustomerInfo,
    removeCustomer,
    getCustomerTicketHistory,
    getCustomerReviewHistory,
    getStatistics,
    searchCustomerList,
    sortCustomers,
    clearError,
    clearCustomerDetail,
  } = useAdminCustomers();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    getCustomers();
    getStatistics();
  }, [getCustomers, getStatistics]);

  const handleViewDetail = (id) => {
    setSelectedCustomerId(id);
    getCustomerDetail(id);
    getCustomerTicketHistory(id);
    getCustomerReviewHistory(id);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedCustomerId(null);
    clearCustomerDetail();
  };

  const handleUpdateCustomer = async () => {
    try {
      await updateCustomerInfo(selectedCustomerId, formData);
      setIsModalVisible(false);
    } catch (err) {
      console.error('Cập nhật thất bại:', err);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await removeCustomer(id);
      } catch (err) {
        console.error('Xóa thất bại:', err);
      }
    }
  };

  const handleSearch = () => {
    searchCustomerList(1, searchTerm, searchType);
  };

  const handleSort = () => {
    sortCustomers(1, sortBy, sortOrder);
  };

  const handlePageChange = (page) => {
    getCustomers(page, { [searchType]: searchTerm });
  };
   useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer); // Dọn dẹp timer khi component unmount hoặc error thay đổi
    }
  }, [error, clearError]);
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý khách hàng</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded flex justify-between items-center">
          <div>
            <p className="font-semibold">Lỗi</p>
            <p>{error}</p>
          </div>
          <button onClick={clearError}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {statistics && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold">Thống kê</h2>
          <p>Tổng khách hàng: {statistics.total_customers}</p>
          <p>Khách hàng mới trong tháng: {statistics.new_customers_this_month}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 p-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="w-32 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Tên</option>
          <option value="email">Email</option>
          <option value="phone">Số điện thoại</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tìm kiếm
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-32 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="created_at">Ngày đăng ký</option>
          <option value="name">Tên</option>
          <option value="email">Email</option>
          <option value="phone">Số điện thoại</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-32 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="asc">Tăng dần</option>
          <option value="desc">Giảm dần</option>
        </select>
        <button
          onClick={handleSort}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <SortAsc className="w-5 h-5 inline mr-2" />
          Sắp xếp
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Tên</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Số điện thoại</th>
              
                  <th className="p-2 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{customer.id}</td>
                    <td className="p-2">{customer.name}</td>
                    <td className="p-2">{customer.email}</td>
                    <td className="p-2">{customer.phone}</td>
                    
                    <td className="p-2">
                      <button
                        onClick={() => handleViewDetail(customer.id)}
                        className="text-blue-500 hover:underline mr-2"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-500 hover:underline"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-4 gap-2">
            {pagination.totalPages > 1 ? (
              Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    pagination.currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))
            ) : (
              <span className="text-gray-500">Trang 1 / 1</span>
            )}
          </div>
        </>
      )}

      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chi tiết khách hàng</h3>
              <button onClick={handleCloseModal}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            {customerDetail && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Tên</label>
                  <input
                    type="text"
                    value={formData.name || customerDetail.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || customerDetail.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone || customerDetail.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    value={formData.address || customerDetail.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                  <input
                    type="text"
                    value={formData.birthdate || customerDetail.birthdate}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Giới tính</label>
                  <select
                    value={formData.gender || customerDetail.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateCustomer}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Cập nhật thông tin
                  </button>
                </div>

                

               
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCus;