// src/hooks/useMovies.js
import { useState, useEffect } from 'react';
import { fetchDanhsachMovies } from '../services/apiMovies';

const useMovies = () => {
  const [movies, setMovies] = useState([]);  // Mảng rỗng làm giá trị mặc định
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const BASE_URL = 'http://127.0.0.1:8000/storage/';
  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchDanhsachMovies();
        const moviesWith = Array.isArray(data)
        ? data.map(movie => ({
            ...movie,
            poster: movie.poster ? `${BASE_URL}${movie.poster}` : null,
        
          }))
        : [];
        setMovies(moviesWith);
      } catch (err) {
        setError('Không thể tải danh sách phim.');
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  return { movies, loading, error };
};

export default useMovies;
