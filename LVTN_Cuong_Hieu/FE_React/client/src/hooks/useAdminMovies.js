import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { fetchMovies, addMovie, updateMovie, deleteMovie } from '../services/ADMINS/movieAdminService';

const defaultMovie = {
  title: '', description: '', duration: '', genre: '',
  director: '', cast: '', poster: '', trailer_url: '',
  release_date: '', end_date: '', status: 0 // default status = 0 (Sắp chiếu)
};

const useMovies = () => {
  const [movies, setMovies] = useState([]);
  const [newMovie, setNewMovie] = useState(defaultMovie);
  const [editingMovie, setEditingMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BASE_URL = 'http://127.0.0.1:8000/storage/';

  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 5;

  const filteredMovies = useMemo(() => {
  if (!searchQuery.trim()) return movies;
  return movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  }, [movies, searchQuery]);



  const totalMoviesCount = movies.length;
  const filteredMoviesCount = filteredMovies.length;


  
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);


  const goToPage = (page) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page);
  }
  };




  // Chuyển status number sang label (chỉ 0 hoặc 1)
  const getStatusLabel = (status) => {
    return Number(status) === 1 ? 'Đang chiếu' : 'Sắp chiếu';
  };

  
  


  // Load danh sách phim
  const loadMovies = async () => {
    try {
      setLoading(true);
      const data = await fetchMovies();

      const moviesWith = Array.isArray(data)
        ? data.map(movie => ({
            ...movie,
            poster: movie.poster ? `${BASE_URL}${movie.poster}` : null,
            statusLabel: getStatusLabel(movie.status),
            status: Number(movie.status) === 1 ? 1 : 0, // chắc chắn chỉ 0 hoặc 1
          }))
        : [];

      setMovies(moviesWith);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách phim.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'checkbox') {
      updateMovieField(name, checked ? 1 : 0); // checkbox => 0 hoặc 1
    } else if (type === 'file') {
      updateMovieField(name, files[0]);
    } else if (name === 'status') {
      // chỉ nhận 0 hoặc 1
      const val = Number(value);
      updateMovieField(name, val === 1 ? 1 : 0);
    } else {
      updateMovieField(name, value);
    }
  };

  const updateMovieField = (field, value) => {
    if (editingMovie) {
      setEditingMovie(prev => ({ ...prev, [field]: value }));
    } else {
      setNewMovie(prev => ({ ...prev, [field]: value }));
    }
  };

  // Tạo FormData gửi lên API, gửi status là 0 hoặc 1
  const createFormData = (movie) => {
    const formData = new FormData();

    formData.append('title', movie.title || '');
    formData.append('description', movie.description || '');
    formData.append('duration', parseInt(movie.duration, 10) || 0);
    formData.append('genre', movie.genre || '');
    formData.append('director', movie.director || '');
    formData.append('cast', movie.cast || '');
    formData.append('trailer_url', movie.trailer_url || '');
    formData.append('release_date', movie.release_date || '');
    formData.append('end_date', movie.end_date || '');

    // Chỉ gửi 0 hoặc 1
    formData.append('status', movie.status === 1 ? 1 : 0);

    if (movie.poster instanceof File) {
      formData.append('poster', movie.poster);
    }

    return formData;
  };

  // Thêm phim
  const handleAddMovie = async () => {
    try {
      const formData = createFormData(newMovie);
      const added = await addMovie(formData);

      const movieWithLabel = {
        ...added,
        poster: added.poster ? `${BASE_URL}${added.poster}` : null,
        statusLabel: getStatusLabel(added.status),
        status: Number(added.status) === 1 ? 1 : 0,
      };

      setMovies(prev => [...prev, movieWithLabel]);
      setNewMovie(defaultMovie);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors).flat().join(' '));
      } else {
        setError('Thêm phim thất bại.');
        setTimeout(() => {
          setError('');
        }, 3000);
      }
    }
  };

  // Cập nhật phim
  const handleUpdateMovie = async () => {
    if (!editingMovie?.id) return;
    try {
      const formData = createFormData(editingMovie);
      const updated = await updateMovie(editingMovie.id, formData);

      const movieWithLabel = {
        ...updated,
        poster: updated.poster ? `${BASE_URL}${updated.poster}` : null,
        statusLabel: getStatusLabel(updated.status),
        status: Number(updated.status) === 1 ? 1 : 0,
      };

      setMovies(prev => prev.map(m => (m.id === movieWithLabel.id ? movieWithLabel : m)));
      setEditingMovie(null);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors).flat().join(' '));
      } else {
        setError('Cập nhật phim thất bại.');
        setTimeout(() => {
          setError('');
        }, 3000);
      }
    }
  };

  // Xóa phim
  const handleDeleteMovie = async (id) => {
    try {
      await deleteMovie(id);
      setMovies(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
      setError('Xóa phim thất bại.');
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

    useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);


  return {
  movies,
  newMovie,
  editingMovie,
  loading,
  error,
  setEditingMovie,
  setNewMovie,
  handleAddMovie,
  handleUpdateMovie,
  handleDeleteMovie,
  handleInputChange,

  // phân trang và tìm kím
  searchQuery,
  setSearchQuery,
  
  totalMoviesCount,
  filteredMoviesCount,

  currentMovies,
  currentPage,
  totalPages,
  goToPage,
};

};

export default useMovies;
