import React, { useState } from 'react';
import useAdminBlog from '../../hooks/useAdminBlogs';

const AdminBlog = () => {
  const {
    formData,
    editingId,
    loading,
    error,
    currentBlogs,
    currentPage,
    totalPages,
    totalBlogs,
    goToPage,
    handleInputChange,
    handleAddBlog,
    handleUpdateBlog,
    handleDeleteBlog,
    handleEditBlog,
    resetForm,
  } = useAdminBlog();

  const [isAdding, setIsAdding] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await handleUpdateBlog();
    } else {
      await handleAddBlog();
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
        <h2 className="text-xl font-bold">Quản lý Blog</h2>
        <div>
          <button
            className="bg-green-600 px-4 py-2 text-white rounded"
            onClick={() => {
              setIsAdding(true);
              resetForm();
            }}
          >
            Thêm Blog
          </button>
          <span className="ml-4 font-semibold">Tổng blog: {totalBlogs}</span>
        </div>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {(isAdding || editingId) && (
        <form onSubmit={handleFormSubmit} className="bg-gray-100 p-4 rounded mb-4 space-y-2">
          <input
            name="admin_id"
            value={formData.admin_id}
            onChange={handleInputChange}
            placeholder="ID Admin"
            className="p-2 border w-full"
            required
          />
          <input
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Tiêu đề"
            className="p-2 border w-full"
            required
          />
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Nội dung"
            className="p-2 border w-full"
            rows={4}
            required
          />
          <input
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            placeholder="URL ảnh"
            className="p-2 border w-full"
          />

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

      {!loading && currentBlogs.length > 0 ? (
        <>
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">ID Blog</th>
                <th className="border p-2">Tiêu đề</th>
                <th className="border p-2">Nội dung</th>
                <th className="border p-2">Ảnh</th>
                <th className="border p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentBlogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="border p-2">{blog.id}</td>
                  <td className="border p-2">{blog.title}</td>
                  <td className="border p-2 truncate max-w-xs">{blog.content}</td>
                  <td className="border p-2">
                    {blog.image ? (
                      <img src={blog.image} alt={blog.title} className="w-20 h-12 object-cover" />
                    ) : (
                      'Không có ảnh'
                    )}
                  </td>
                  <td className="border p-2 space-x-2">
                    <button
                      className="text-blue-600"
                      onClick={() => {
                        handleEditBlog(blog);
                        setIsAdding(false);
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDeleteBlog(blog.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
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
        <p className="text-center text-gray-600 mt-4">Không có blog nào.</p>
      )}
    </div>
  );
};

export default AdminBlog;
