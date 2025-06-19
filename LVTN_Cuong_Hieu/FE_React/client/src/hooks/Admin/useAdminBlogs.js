import { useEffect, useState } from 'react';
import {
  fetchBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  countBlog,
  getBlogDetail,
} from '../../services/ADMINS/apiAdminBlogs';

const defaultForm = {
  admin_id: '',
  title: '',
  content: '',
  image: '', // File hoặc URL
};

const BASE_URL = 'http://127.0.0.1:8000/storage/';

export default function useAdminBlog() {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // API Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [perPage] = useState(10); // Số blogs per page từ API
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const loadBlogs = async (page = 1) => {
    try {
      setLoading(true);
      const data = await fetchBlog(page, perPage);
      
      const blogsWithImage = Array.isArray(data?.data)
        ? data.data.map(blog => ({
            ...blog,
            image: blog.image ? `${BASE_URL}${blog.image}` : '',
          }))
        : [];

      setBlogs(blogsWithImage);
      setCurrentPage(data.current_page || 1);
      setTotalPages(data.last_page || 1);
      setTotalBlogs(data.total || 0);

      console.log('API Pagination Info:', {
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
        per_page: data.per_page,
        from: data.from,
        to: data.to
      });
    } catch (error) {
      console.error('Load blogs error:', error);
      setError('Không thể tải blog');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs(1);
  }, []);

  // Reset về trang 1 khi search
  useEffect(() => {
    if (searchQuery.trim()) {
      // Nếu có search, có thể implement search API endpoint
      // Hoặc load tất cả data để filter local
      console.log('Search:', searchQuery);
    } else {
      loadBlogs(1);
    }
  }, [searchQuery]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      loadBlogs(page);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const createFormData = (data) => {
    const form = new FormData();
    form.append('admin_id', data.admin_id || '');
    form.append('title', data.title || '');
    form.append('content', data.content || '');
    if (data.image instanceof File) {
      form.append('image', data.image);
    }
    return form;
  };

  const handleAddBlog = async () => {
    try {
      const form = createFormData(formData);
      await createBlog(form);

      // Reload current page để thấy blog mới
      await loadBlogs(currentPage);
      resetForm();
    } catch (err) {
      console.error('Create blog error:', err);
      setError('Không thể thêm blog');
    }
  };

  const handleUpdateBlog = async () => {
    try {
      const form = createFormData(formData);
      await updateBlog(editingId, form);

      // Reload current page để thấy thông tin đã update
      await loadBlogs(currentPage);
      resetForm();
    } catch (err) {
      console.error('Update blog error:', err);
      setError('Không thể cập nhật blog');
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa blog này?')) return;
    try {
      await deleteBlog(id);
      
      // Nếu trang hiện tại không còn data, chuyển về trang trước
      if (blogs.length === 1 && currentPage > 1) {
        await loadBlogs(currentPage - 1);
      } else {
        await loadBlogs(currentPage);
      }
    } catch (err) {
      console.error('Delete blog error:', err);
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
    blogs, // Danh sách blogs hiện tại của page
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
  };
}