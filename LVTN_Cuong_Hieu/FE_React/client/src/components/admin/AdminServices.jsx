import React, { useState } from 'react';
import useAdminServices from '../../hooks/useAdminServices';

const statusLabels = {
  true: 'Hiển thị',
  false: 'Ẩn',
};

const AdminServices = () => {
  const {
    formData,
    editingId,
    handleInputChange,
    handleAddService,
    handleUpdateService,
    handleDeleteService,
    handleEditService,
    resetForm,
    loading,
    error,
    currentServices,
    currentPage,
    totalPages,
    goToPage,
  } = useAdminServices();

  const [isAdding, setIsAdding] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await handleUpdateService();
    } else {
      await handleAddService();
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsAdding(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý dịch vụ</h2>
        <button
          className="bg-green-600 px-4 py-2 text-white rounded"
          onClick={() => {
            setIsAdding(true);
            resetForm();
          }}
        >
          Thêm dịch vụ
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {(isAdding || editingId) && (
        <form onSubmit={handleFormSubmit} className="bg-gray-100 p-4 rounded mb-4 space-y-2">
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Tên dịch vụ"
            className="p-2 border w-full"
            required
          />
          <input
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Mô tả"
            className="p-2 border w-full"
          />
          <input
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Giá"
            type="number"
            className="p-2 border w-full"
          />
          <input
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            placeholder="URL hình ảnh"
            className="p-2 border w-full"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="status"
              checked={!!formData.status}
              onChange={handleInputChange}
            />
            <span>Hiển thị</span>
          </label>
          <div className="space-x-2">
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
              {editingId ? 'Cập nhật' : 'Thêm'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 text-white px-3 py-1 rounded"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {!loading && currentServices.length > 0 ? (
        <>
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Tên dịch vụ</th>
                <th className="border p-2">Mô tả</th>
                <th className="border p-2">Giá</th>
           
                <th className="border p-2">Trạng thái</th>
                <th className="border p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentServices.map((service) => (
                <tr key={service.id}>
                  <td className="border p-2">{service.name}</td>
                  <td className="border p-2">{service.description}</td>
                  <td className="border p-2">{service.price}đ</td>
                 
                  <td className="border p-2">
                        <span
                            className={`px-2 py-1 rounded text-white text-sm ${
                            !!service.status ? 'bg-green-500' : 'bg-red-500'
                            }`}
                        >
                            {statusLabels[!!service.status]}
                        </span>
                  </td>

                  <td className="border p-2 space-x-2">
                    <button
                      className="text-blue-600"
                      onClick={() => {
                        handleEditService(service);
                        setIsAdding(false);
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center mt-4 space-x-2">
            <button
              className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo;
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`px-3 py-1 border rounded ${
                  currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => goToPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &raquo;
            </button>
          </div>
        </>
      ) : loading ? (
        <p className="text-center text-gray-600 mt-4">Đang tải...</p>
      ) : (
        <p className="text-center text-gray-600 mt-4">Không có dịch vụ nào.</p>
      )}
    </div>
  );
};

export default AdminServices;
