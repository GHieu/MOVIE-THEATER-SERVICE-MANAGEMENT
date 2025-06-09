import apiAdmin from './apiAdmin';


export const getAllServices = async () => {
  const res = await apiAdmin.get('/services');
  return res.data;
};

export const createService = async (data) => {
  const res = await apiAdmin.post('/services', data);
  return res.data;
};


export const deleteService = async (id) => {
    const res = await apiAdmin.delete(`/services/${id}`);
    return res.data;
};

export const updateService = async (id, data) => {
  const res = await apiAdmin.put(`/services/${id}`, data);
  return res.data;
};