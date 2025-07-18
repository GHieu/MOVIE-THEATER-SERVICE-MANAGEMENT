import { useMemo, useEffect, useState } from 'react';
import { fetchMovies, addMovie, updateMovie, deleteMovie } from '../../services/ADMINS/apiAdminMovie';

const defaultMovie = {
  title: '', description: '', duration: '', genre: '',
  director: '', cast: '', nation: '', poster: '', banner: '',
  trailer_url: '', release_date: '', end_date: '',
  status: 0, age: '', type: '', studio: ''
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

  // Helper function to get current date in Vietnam timezone
  const getCurrentDateVN = () => {
    const now = new Date();
    // Convert to Vietnam timezone (UTC+7)
    const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return vnTime.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Enhanced function to automatically manage movie status based on dates
  const checkAndUpdateMovieStatus = async (moviesList) => {
    const today = getCurrentDateVN();
    console.log('Current date (VN timezone):', today);
    
    const moviesToUpdate = moviesList.filter(movie => {
      // Skip movies without release_date
      if (!movie.release_date) return false;
      
      const releaseDate = movie.release_date;
      const endDate = movie.end_date;
      const currentType = movie.type;
      const currentStatus = Number(movie.status);
      
      let shouldUpdate = false;
      let newType = currentType;
      let newStatus = currentStatus;
      
      console.log(`Checking movie "${movie.title}":`, {
        releaseDate,
        endDate,
        today,
        currentType,
        currentStatus
      });
      
      // Case 1: Movie has ended (end_date < today) - FIXED: Changed from <= to <
      if (endDate && endDate < today) {
        if (currentType !== 'stop_showing' || currentStatus !== 0) {
          newType = 'stop_showing';
          newStatus = 0; // Hidden
          shouldUpdate = true;
          console.log(`→ Should update to stop_showing (hidden) - movie ended`);
        }
      }
      // Case 2: Movie is currently showing (release_date <= today <= end_date)
      else if (releaseDate <= today && (!endDate || endDate >= today)) {
        let needsUpdate = false;
        
        if (currentType !== 'now_showing') {
          newType = 'now_showing';
          needsUpdate = true;
        }
        
        // Always set status to 1 (visible) for now_showing movies
        if (currentStatus !== 1) {
          newStatus = 1;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          shouldUpdate = true;
          console.log(`→ Should update to now_showing (visible)`);
        }
      }
      // Case 3: Movie is coming soon (release_date > today)
      else if (releaseDate > today) {
        let needsUpdate = false;
        
        if (currentType !== 'coming_soon') {
          newType = 'coming_soon';
          needsUpdate = true;
        }
        
        // Set status to 1 (visible) for coming_soon movies
        if (currentStatus !== 1) {
          newStatus = 1;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          shouldUpdate = true;
          console.log(`→ Should update to coming_soon (visible)`);
        }
      }
      
      // Store the new values for later use
      if (shouldUpdate) {
        movie._newType = newType;
        movie._newStatus = newStatus;
        return true;
      }
      
      return false;
    });

    // If there are movies to update, process them
    if (moviesToUpdate.length > 0) {
      console.log(`Found ${moviesToUpdate.length} movies to update status/type...`);
      
      // Update each movie
      const updatePromises = moviesToUpdate.map(async (movie) => {
        try {
          const formData = new FormData();
          formData.append('title', movie.title || '');
          formData.append('description', movie.description || '');
          formData.append('duration', parseInt(movie.duration, 10) || 0);
          formData.append('genre', movie.genre || '');
          formData.append('director', movie.director || '');
          formData.append('cast', movie.cast || '');
          formData.append('nation', movie.nation || '');
          formData.append('studio', movie.studio || '');
          formData.append('release_date', movie.release_date || '');
          formData.append('end_date', movie.end_date || '');
          formData.append('status', movie._newStatus !== undefined ? movie._newStatus : Number(movie.status));
          formData.append('age', movie.age || '');
          formData.append('type', movie._newType || movie.type);

          await updateMovie(movie.id, formData);
          
          const statusText = movie._newStatus === 0 ? 'hidden' : 'visible';
          console.log(`✅ Updated movie "${movie.title}" to type: ${movie._newType}, status: ${statusText}`);
        } catch (error) {
          console.error(`❌ Failed to update movie "${movie.title}":`, error);
        }
      });

      await Promise.all(updatePromises);
      return true; // Has updates
    }
    
    return false; // No updates
  };

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

  // Enhanced status and type label functions
  const getStatusLabel = (status) => {
    return Number(status) === 1 ? 'Hiển thị' : 'Ẩn';
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'now_showing':
        return 'Đang chiếu';
      case 'coming_soon':
        return 'Sắp chiếu';
      case 'stop_showing':
        return 'Đã kết thúc';
      default:
        return type;
    }
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
            statusLabel: getStatusLabel(movie.status),
            typeLabel: getTypeLabel(movie.type),
            status: Number(movie.status),
            // Lưu lại original data để dùng khi edit
            originalPoster: movie.poster,
            originalBanner: movie.banner,
            originalTrailerUrl: movie.trailer_url,
          }))
        : [];

      // Kiểm tra và tự động cập nhật trạng thái phim
      const hasUpdates = await checkAndUpdateMovieStatus(moviesWithUrls);
      
      // Nếu có cập nhật, load lại dữ liệu để đảm bảo đồng bộ
      if (hasUpdates) {
        console.log('🔄 Reloading movies after auto-update...');
        const updatedData = await fetchMovies(page, search);
        const updatedMoviesWithUrls = Array.isArray(updatedData.data)
          ? updatedData.data.map(movie => ({
              ...movie,
              poster: movie.poster ? `${BASE_URL}${movie.poster}` : null,
              banner: movie.banner ? `${BASE_URL}${movie.banner}` : null,
              statusLabel: getStatusLabel(movie.status),
              typeLabel: getTypeLabel(movie.type),
              status: Number(movie.status),
              originalPoster: movie.poster,
              originalBanner: movie.banner,
            }))
          : [];
        
        setMovies(updatedMoviesWithUrls);
        setPaginationData({
          current_page: updatedData.current_page,
          last_page: updatedData.last_page,
          per_page: updatedData.per_page,
          total: updatedData.total,
          from: updatedData.from,
          to: updatedData.to
        });
      } else {
        setMovies(moviesWithUrls);
        setPaginationData({
          current_page: data.current_page,
          last_page: data.last_page,
          per_page: data.per_page,
          total: data.total,
          from: data.from,
          to: data.to
        });
      }

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

  // Tạo FormData
  const createFormData = (movie) => {
    const formData = new FormData();

    formData.append('title', movie.title || '');
    formData.append('description', movie.description || '');
    formData.append('duration', parseInt(movie.duration, 10) || 0);
    formData.append('genre', movie.genre || '');
    formData.append('director', movie.director || '');
    formData.append('cast', movie.cast || '');
    formData.append('nation', movie.nation || '');
    formData.append('studio', movie.studio || '');
    formData.append('release_date', movie.release_date || '');
    formData.append('end_date', movie.end_date || '');
    formData.append('status', Number(movie.status) === 1 ? 1 : 0);
    formData.append('age', movie.age || '');
    formData.append('type', movie.type || '');

    // Chỉ append file nếu user chọn file mới
    if (movie.poster instanceof File) {
      formData.append('poster', movie.poster);
    }

    if (movie.banner instanceof File) {
      formData.append('banner', movie.banner);
    }
    if (movie.trailer_url instanceof File) {
      formData.append('trailer_url', movie.trailer_url);
    }
    return formData;
  };

  // Thêm phim
  const handleAddMovie = async () => {
    try {
      const formData = createFormData(newMovie);
      const response = await addMovie(formData);
      
      console.log('Add movie response:', response);

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

  // Cập nhật phim
  const handleUpdateMovie = async () => {
    if (!editingMovie?.id) return;
    
    try {
      const movieDataToUpdate = {
        ...editingMovie,
        status: Number(editingMovie.status)
      };
      
      console.log('Updating movie with data:', movieDataToUpdate);
      
      const formData = createFormData(movieDataToUpdate);
      
      const response = await updateMovie(editingMovie.id, formData);
      
      console.log('Update movie response:', response);

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
    paginationData,
    
    // Helper functions
    getStatusLabel,
    getTypeLabel
  };
};

export default useMovies;