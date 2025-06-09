// src/hooks/useMovieDetail.js
import { useEffect, useState } from 'react';
import { fetchDanhsachMoviesID } from '../services/apiMovies';

const useMovieDetail = (id) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const BASE_URL = 'http://127.0.0.1:8000/storage/';

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchDanhsachMoviesID(id);
        const movieWithPoster = {
          ...data,
          poster: data.poster ? `${BASE_URL}${data.poster}` : null,
        };
        setMovie(movieWithPoster);
      } catch (err) {
        console.error('Lỗi gọi API chi tiết phim:', err);
        setError('Không thể tải thông tin phim.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { movie, loading, error };
};

export default useMovieDetail;
