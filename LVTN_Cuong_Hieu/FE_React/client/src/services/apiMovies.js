import api from './api';




// src/services/apiMovies.js
export const fetchDanhsachMovies = async () => {
  const response = await api.get('/movies');
  return response.data;
};



export const fetchDanhsachMoviesID = async (id) => {
  const response = await api.get(`/movies/${id}`); // route này yêu cầu token và trả về thông tin người dùng
  return response.data;
};


