import apiAdmin from './apiAdmin';

export const getPromotions = async () => {
  const res = await apiAdmin.get('/promotions');
  return res.data;
};

export const addPromotion = async (data) => {
  const res = await apiAdmin.post('/promotions', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

export const deletePromotion = async (id) => {
  const res = await apiAdmin.delete(`/promotions/${id}`);
  return res.data;
};
