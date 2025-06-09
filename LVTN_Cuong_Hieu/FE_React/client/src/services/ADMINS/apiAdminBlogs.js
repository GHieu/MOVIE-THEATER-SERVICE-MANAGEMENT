import apiAdmin from './apiAdmin';

export const fetchBlog = async () => {
  const res = await apiAdmin.get('/blogs');
  return res.data; 
};


export const createBlog = async (data) => {
  const res = await apiAdmin.post('/blogs', data);
  return res.data;
};


export const deleteBlog = async (id) => {
    const res = await apiAdmin.delete(`/blogs/${id}`);
    return res.data;
};


export const updateBlog = async (id, blogData) => {
  const formData = new FormData();
  for (const key in blogData) {
    formData.append(key, blogData[key]);
  }

  const res = await apiAdmin.put(`/blogs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};


// Đếm tổng số 
export const countBlog = async () => {
  const res = await apiAdmin.get('/blogs/count');
  return res.data.total_blogs || 0;

};










