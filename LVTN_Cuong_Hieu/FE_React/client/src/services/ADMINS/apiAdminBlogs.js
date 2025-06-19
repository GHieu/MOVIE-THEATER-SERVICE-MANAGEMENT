import apiAdmin from './apiAdmin';

export const fetchBlog = async (page = 1, perPage = 10) => {
  const res = await apiAdmin.get(`/blogs?page=${page}&per_page=${perPage}`);
  return res.data;
};

export const createBlog = async (data) => {
  const res = await apiAdmin.post('/blogs', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const deleteBlog = async (id) => {
  const res = await apiAdmin.delete(`/blogs/${id}`);
  return res.data;
};

export const updateBlog = async (id, formData) => {
  const res = await apiAdmin.post(`/blogs/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
    },
  });
  return res.data;
};

// Đếm tổng số
export const countBlog = async () => {
  const res = await apiAdmin.get('/blogs/count');
  return res.data.total_blogs || 0;
};

// Thêm function để lấy chi tiết blog (bao gồm admin info)
export const getBlogDetail = async (id) => {
  const res = await apiAdmin.get(`/blogs/${id}`);
  return res.data;
};