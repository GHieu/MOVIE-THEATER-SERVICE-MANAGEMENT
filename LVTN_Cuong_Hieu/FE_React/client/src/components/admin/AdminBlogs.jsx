import React, { useState } from 'react';
import useAdminBlog from '../../hooks/Admin/useAdminBlogs';
import { Pencil, Trash2 } from 'lucide-react';

const AdminBlog = () => {
  const {
    blogs, // Danh sách blogs của trang hiện tại
    currentPage, // Trang hiện tại từ API
    totalPages, // Tổng số trang từ API
    totalBlogs, // Tổng số blogs từ API
    perPage, // Số blogs per page
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

  const isEditing = Boolean(editingId);
  const blogData = formData;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await handleUpdateBlog();
    } else {
      await handleAddBlog();
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    resetForm();
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
            className="bg-green-600 px-4 py-2 text-white rounded"
            onClick={() => {
              setIsAdding(true);
              resetForm();
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
          className="p-2 border rounded w-full max-w-md"
        />
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Form thêm / sửa */}
      {(isAdding || editingId) && (
        <form onSubmit={handleFormSubmit} className="bg-gray-100 p-4 rounded mb-4 space-y-3">
          <input
            name="admin_id"
            value={blogData.admin_id}
            onChange={handleInputChange}
            placeholder="ID Admin"
            className="p-2 border w-full"
            required
          />
          <input
            name="title"
            value={blogData.title}
            onChange={handleInputChange}
            placeholder="Tiêu đề"
            className="p-2 border w-full"
            required
          />
          <textarea
            name="content"
            value={blogData.content}
            onChange={handleInputChange}
            placeholder="Nội dung"
            className="p-2 border w-full"
            rows={4}
            required
          />
          <div>
            <label className="block mb-1">Ảnh blog:</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
              className="p-2 border w-full"
            />
            {blogData.image && typeof blogData.image === 'string' && (
              <img src={blogData.image} alt="Preview" className="w-32 h-20 object-cover mt-2" />
            )}
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              {isEditing ? 'Cập nhật' : 'Thêm'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Hủy
            </button>
          </div>
        </form>
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
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDeleteBlog(blog.id)}
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