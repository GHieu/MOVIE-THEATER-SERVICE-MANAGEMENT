import apiAdmin from './apiAdmin';

export const getMembership = async () => {
  const res = await apiAdmin.get('/memberships');
  return res.data;
};

export const addMemberships = async (data) => {
  const res = await apiAdmin.post('/memberships', data);
  return res.data;
};

export const updateMembership = async (id, data) => {
  
  const res = await apiAdmin.post(`/memberships/${id}`, data); // Đổi từ PUT sang POST
  return res.data;
};
