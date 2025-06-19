// hooks/useMovieBlogs.js
import { useState, useEffect } from 'react';
import { fetchAllBlog } from '../services/apiBlogs'; // Đảm bảo gọi đúng hàm fetch
export default function useMovieBlogs(initialPage = 1, perPage = 6, search = '') {
  const [blogs, setBlogs] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(initialPage);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchAllBlog(page, perPage, search);
      setBlogs(data.data);
      setMeta({
        current_page: data.current_page,
        total: data.total,
        last_page: data.last_page,
      });
    } catch (err) {
      setError('Lỗi khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  return {
    blogs,
    loading,
    error,
    meta,
    currentPage: meta.current_page,
    totalPages: meta.last_page,
    setPage,
    refetch: fetchData,
  };
}
