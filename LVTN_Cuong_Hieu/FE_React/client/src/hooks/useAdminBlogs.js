import { useEffect, useState } from 'react';
import {
  fetchBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  countBlog,
} from '../services/ADMINS/apiAdminBlogs';

const defaultForm = {
  admin_id: '', // nhớ set đúng admin id
  title: '',
  content: '',
  image: '', // URL hoặc string
};

export default function useAdminBlog() {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalBlogs, setTotalBlogs] = useState(0);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;

  useEffect(() => {
    loadBlogs();
    loadCount();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const data = await fetchBlog();
      setBlogs(data.data || []); // giả sử API trả về {data: [...]}
      setLoading(false);
    } catch (error) {
      console.error('Load blogs error:', error);
      setError('Không thể tải blog');
      setBlogs([]);
      setLoading(false);
    }
  };

  const loadCount = async () => {
    try {
      const count = await countBlog();
      setTotalBlogs(count);
    } catch (error) {
      console.error('Count blogs error:', error);
      setTotalBlogs(0);
    }
  };

  // Lấy blog hiện tại theo trang
  const currentBlogs = blogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddBlog = async () => {
    try {
      await createBlog(formData);
      resetForm();
      await loadBlogs();
      await loadCount();
    } catch (error) {
      console.error('Create blog error:', error);
      setError('Không thể thêm blog');
    }
  };

  const handleUpdateBlog = async () => {
    try {
      await updateBlog(editingId, formData);
      resetForm();
      await loadBlogs();
      await loadCount();
    } catch (error) {
      console.error('Update blog error:', error);
      setError('Không thể cập nhật blog');
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa blog này?')) return;
    try {
      await deleteBlog(id);
      await loadBlogs();
      await loadCount();
    } catch (error) {
      console.error('Delete blog error:', error);
      setError('Không thể xóa blog');
    }
  };

  const handleEditBlog = (blog) => {
    setFormData({
      admin_id: blog.admin_id || '',
      title: blog.title || '',
      content: blog.content || '',
      image: blog.image || '',
    });
    setEditingId(blog.id);
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingId(null);
  };

  return {
    blogs,
    currentBlogs,
    currentPage,
    totalPages,
    totalBlogs,
    goToPage,
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
  };
}
