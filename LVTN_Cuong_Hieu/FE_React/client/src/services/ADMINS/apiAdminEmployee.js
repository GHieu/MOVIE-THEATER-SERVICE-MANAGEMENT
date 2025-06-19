import apiAdmin from './apiAdmin';

// Lấy danh sách nhân viên (có tìm kiếm, phân trang)
export const fetchEmployees = async (queryParams = '') => {
  const url = queryParams ? `/employees?${queryParams}` : '/employees';
  const res = await apiAdmin.get(url);
  return res.data; // Gồm: data, current_page, last_page, total, per_page,...
};

// Thêm nhân viên
export const addEmployee = async (formData) => {
  const res = await apiAdmin.post('/employees', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Cập nhật nhân viên
export const updateEmployee = async (id, formData) => {
  const res = await apiAdmin.post(`/employees/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Xóa nhân viên (nếu cần)
export const deleteEmployee = async (id) => {
  const res = await apiAdmin.delete(`/employees/${id}`);
  return res.data;
};