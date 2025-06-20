import { useMemo, useEffect, useState } from 'react';
import { fetchMovies, addMovie, updateMovie, deleteMovie } from '../../services/ADMINS/apiAdminMovie';

const defaultMovie = {
  title: '', description: '', duration: '', genre: '',
  director: '', cast: '', nation: '', poster: '', banner: '',
  trailer_url: '', release_date: '', end_date: '',
  status: 0, age: '', type: ''
};

const useMovies = () => {
  const [movies, setMovies] = useState([]);
  const [newMovie, setNewMovie] = useState(defaultMovie);
  const [editingMovie, setEditingMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination state từ server
  const [paginationData, setPaginationData] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  });

  const BASE_URL = 'http://127.0.0.1:8000/storage/';

  // Filtered movies cho search (client-side filtering)
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return movies;
    return movies.filter(movie =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [movies, searchQuery]);

  // Pagination info
  const currentPage = paginationData.current_page;
  const totalPages = paginationData.last_page;
  const totalMoviesCount = paginationData.total;
  const currentMoviesCount = movies.length;
  const showingFrom = paginationData.from;
  const showingTo = paginationData.to;

  // Chuyển status number sang label - FIX: Đây là trạng thái hiển thị, không phải type
  const getStatusLabel = (status) => {
    return Number(status) === 1 ? 'Hiển thị' : 'Ẩn';
  };

  // Chuyển type sang label
  const getTypeLabel = (type) => {
    return type === 'now_showing' ? 'Đang chiếu' : 'Sắp chiếu';
  };

  // Load danh sách phim với phân trang
  const loadMovies = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const data = await fetchMovies(page, search);

      // Cập nhật movies với URL đầy đủ
      const moviesWithUrls = Array.isArray(data.data)
        ? data.data.map(movie => ({
            ...movie,
            poster: movie.poster ? `${BASE_URL}${movie.poster}` : null,
            banner: movie.banner ? `${BASE_URL}${movie.banner}` : null,
            statusLabel: getStatusLabel(movie.status), // Trạng thái hiển thị
            typeLabel: getTypeLabel(movie.type), // Loại chiếu
            status: Number(movie.status),
            // Lưu lại original data để dùng khi edit
            originalPoster: movie.poster,
            originalBanner: movie.banner,
          }))
        : [];

      setMovies(moviesWithUrls);
      
      // Cập nhật pagination data
      setPaginationData({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
        from: data.from,
        to: data.to
      });

    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách phim.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // Chuyển trang
  const goToPage = async (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      await loadMovies(page, searchQuery);
    }
  };

  // Tìm kiếm
  const handleSearch = async (query) => {
    setSearchQuery(query);
    await loadMovies(1, query); // Reset về trang 1 khi search
  };

  // Clear search
  const clearSearch = async () => {
    setSearchQuery('');
    await loadMovies(1, ''); // Reset về trang 1
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'checkbox') {
      updateMovieField(name, checked ? 1 : 0);
    } else if (type === 'file') {
      updateMovieField(name, files[0]);
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

  // Tạo FormData - FIX: Xử lý đúng việc upload file khi edit
  const createFormData = (movie) => {
    const formData = new FormData();

    formData.append('title', movie.title || '');
    formData.append('description', movie.description || '');
    formData.append('duration', parseInt(movie.duration, 10) || 0);
    formData.append('genre', movie.genre || '');
    formData.append('director', movie.director || '');
    formData.append('cast', movie.cast || '');
    formData.append('nation', movie.nation || '');
    formData.append('trailer_url', movie.trailer_url || '');
    formData.append('release_date', movie.release_date || '');
    formData.append('end_date', movie.end_date || '');
    formData.append('status', Number(movie.status) === 1 ? 1 : 0);
    formData.append('age', movie.age || '');
    formData.append('type', movie.type || '');

    // FIX: Chỉ append file nếu user chọn file mới
    if (movie.poster instanceof File) {
      formData.append('poster', movie.poster);
    }

    if (movie.banner instanceof File) {
      formData.append('banner', movie.banner);
    }

    return formData;
  };

  // Thêm phim
  const handleAddMovie = async () => {
    try {
      const formData = createFormData(newMovie);
      const response = await addMovie(formData);
      
      console.log('Add movie response:', response); // Debug log

      // Reload trang hiện tại để cập nhật danh sách
      await loadMovies(currentPage, searchQuery);
      setNewMovie(defaultMovie);
    } catch (err) {
      console.error('Add movie error:', err);
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors).flat().join(' '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Thêm phim thất bại.');
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  // FIX: Cập nhật phim - Xử lý đúng editingMovie
  const handleUpdateMovie = async () => {
    if (!editingMovie?.id) return;
    
    try {
      // Tạo object data để gửi lên server
      const movieDataToUpdate = {
        ...editingMovie,
        status: Number(editingMovie.status) // Đảm bảo status là number
      };
      
      console.log('Updating movie with data:', movieDataToUpdate); // Debug log
      
      const formData = createFormData(movieDataToUpdate);
      
      // Debug: Log FormData content
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await updateMovie(editingMovie.id, formData);
      
      console.log('Update movie response:', response); // Debug log

      // FIX: Force reload để đảm bảo dữ liệu được cập nhật
      setEditingMovie(null);
      await loadMovies(currentPage, searchQuery);
      
    } catch (err) {
      console.error('Update movie error:', err);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(', '));
        console.log('Validation errors:', err.response.data.errors);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Cập nhật phim thất bại.');
      }
      setTimeout(() => setError(''), 5000);
    }
  };

  // Xóa phim
  const handleDeleteMovie = async (id) => {
    try {
      await deleteMovie(id);
      
      // Kiểm tra nếu trang hiện tại không còn dữ liệu thì chuyển về trang trước
      const newTotal = totalMoviesCount - 1;
      const maxPage = Math.ceil(newTotal / paginationData.per_page) || 1;
      const targetPage = currentPage > maxPage ? maxPage : currentPage;
      
      await loadMovies(targetPage, searchQuery);
    } catch (err) {
      console.error(err);
      setError('Xóa phim thất bại.');
      setTimeout(() => setError(''), 3000);
    }
  };



  // Load movies khi component mount
  useEffect(() => {
    loadMovies();
  }, []);

  return {
    movies: searchQuery ? filteredMovies : movies,
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

    // Search
    searchQuery,
    setSearchQuery,
    handleSearch,
    clearSearch,
    
    // Pagination info
    currentPage,
    totalPages,
    totalMoviesCount,
    currentMoviesCount,
    showingFrom,
    showingTo,
    goToPage,

    // Additional data
    paginationData
  };
};

export default useMovies;