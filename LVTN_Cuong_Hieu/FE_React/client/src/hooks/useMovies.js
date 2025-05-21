import { useState, useEffect } from 'react';
import api from '../services/api';

export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/movies')
      .then(res => setMovies(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { movies, loading, error };
}