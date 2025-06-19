import apiAdmin from './apiAdmin';
// Lấy danh sách dịch vụ
export const getAllServices = async () => {
  const res = await apiAdmin.get('/services');
  return res.data.services?.data || res.data; // hỗ trợ cả phân trang và không phân trang
};
// Thêm dịch vụ
export const createService = async (formData) => {
  const res = await apiAdmin.post('/services', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
    },
  });
  return res.data;
};
// Cập nhật dịch vụ
export const updateService = async (id, formData) => {
  const res = await apiAdmin.post(`/services/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
    },
  });
  return res.data;
};
// Xóa dịch vụ
export const deleteService = async (id) => {
  const res = await apiAdmin.delete(`/services/${id}`);
  return res.data.message || 'Xóa thành công';
};
// Đếm tổng số dịch vụ (tuỳ backend có hỗ trợ không)
export const countServices = async () => {
  const res = await apiAdmin.get('/services/count');
  return res.data.total_services || 0;
};
