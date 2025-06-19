// hooks/useBlogDetail.js
import { useState, useEffect, useCallback } from 'react';
import { fetchBlogById, fetchRelatedBlogs } from '../services/apiBlogs';

const useBlogDetail = (blogId) => {
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load blog detail
  const loadBlogDetail = useCallback(async () => {
    if (!blogId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Load blog detail
      const response = await fetchBlogById(blogId);
      const blogData = response.data || response;
      setBlog(blogData);
      
      // Load related blogs (nếu có API)
      try {
        const relatedResponse = await fetchRelatedBlogs(blogId);
        setRelatedBlogs(relatedResponse.data || []);
      } catch (relatedError) {
        console.warn('Could not load related blogs:', relatedError);
        setRelatedBlogs([]);
      }
      
    } catch (err) {
      console.error('Error fetching blog detail:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải bài viết');
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    loadBlogDetail();
  }, [loadBlogDetail]);

  // Refetch function
  const refetchBlog = useCallback(async () => {
    await loadBlogDetail();
  }, [loadBlogDetail]);

  return {
    blog,
    relatedBlogs,
    loading,
    error,
    refetchBlog
  };
};

export default useBlogDetail;