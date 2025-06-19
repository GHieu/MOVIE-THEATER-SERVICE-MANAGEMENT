// services/apiBlogs.js
import api from "./api";

// Lấy tất cả blogs với pagination
export const fetchAllBlog = async (page = 1, perPage = 10) => {
    try {
        const res = await api.get('/blogs', {
            params: {
                page,
                per_page: perPage
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error fetching blogs:', error);
        throw error;
    }
};

// Lấy chi tiết blog theo ID
export const fetchBlogById = async (id) => {
    try {
        const res = await api.get(`/blogs/${id}`);
        return res.data;
    } catch (error) {
        console.error('Error fetching blog detail:', error);
        throw error;
    }
};

// Lấy blogs liên quan (giả sử API hỗ trợ)
export const fetchRelatedBlogs = async (blogId, limit = 3) => {
    try {
        const res = await api.get(`/blogs/${blogId}/related`, {
            params: { limit }
        });
        return res.data;
    } catch (error) {
        // Nếu API không hỗ trợ related blogs, trả về blogs mới nhất
        console.warn('Related blogs API not available, fetching latest blogs');
        return await fetchAllBlog(1, limit);
    }
};

// Tìm kiếm blogs
export const searchBlogs = async (query, page = 1) => {
    try {
        const res = await api.get('/blogs/search', {
            params: {
                q: query,
                page
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error searching blogs:', error);
        throw error;
    }
};

// Tăng view count (nếu API hỗ trợ)
export const incrementBlogView = async (blogId) => {
    try {
        const res = await api.post(`/blogs/${blogId}/view`);
        return res.data;
    } catch (error) {
        console.warn('View increment not supported:', error);
        return null;
    }
};