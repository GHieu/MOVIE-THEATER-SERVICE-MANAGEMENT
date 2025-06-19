// src/hooks/useMovies.js - Enhanced for booking page
import { useState, useEffect, useCallback } from 'react'; 
import { 
  fetchNowShowingMovies, 
  fetchComingSoonMovies, 
  searchMovies, 
  fetchAllMovies,
  fetchMoviesWithFilters,
  fetchMovieById  // Thêm import này
} from '../services/apiMovies'; 
 
const BASE_URL = 'http://127.0.0.1:8000/storage/'; 
 
const useMoviesUser = () => { 
  const [nowShowing, setNowShowing] = useState([]); 
  const [comingSoon, setComingSoon] = useState([]); 
  const [allMovies, setAllMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [currentMovie, setCurrentMovie] = useState(null); // Thêm state cho phim hiện tại
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(''); 
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [movieLoading, setMovieLoading] = useState(false); // Loading riêng cho việc load 1 phim
  const [movieError, setMovieError] = useState(''); // Error riêng cho việc load 1 phim
 
  // Hàm thêm đường dẫn đầy đủ cho poster và banner
  const addPosterPath = useCallback((movieOrList) => {
    // Xử lý cho 1 phim đơn lẻ
    if (!Array.isArray(movieOrList)) {
      return {
        ...movieOrList,
        poster: movieOrList.poster ? `${BASE_URL}${movieOrList.poster}` : null,
        banner: movieOrList.banner ? `${BASE_URL}${movieOrList.banner}` : null,
      };
    }
    
    // Xử lý cho danh sách phim
    return movieOrList.map((movie) => ({ 
      ...movie, 
      poster: movie.poster ? `${BASE_URL}${movie.poster}` : null, 
      banner: movie.banner ? `${BASE_URL}${movie.banner}` : null, 
    }));
  }, []);

  // Load danh sách phim ban đầu (đang chiếu và sắp chiếu)
  useEffect(() => { 
    const loadMovies = async () => { 
      setLoading(true); 
      setError(''); 
      try { 
        const [now, soon] = await Promise.all([ 
          fetchNowShowingMovies(), 
          fetchComingSoonMovies(), 
        ]); 
 
        setNowShowing(addPosterPath(now)); 
        setComingSoon(addPosterPath(soon)); 
      } catch (err) { 
        console.error('Lỗi tải phim:', err); 
        setError('Không thể tải danh sách phim.'); 
      } finally { 
        setLoading(false); 
      } 
    }; 
 
    loadMovies(); 
  }, [addPosterPath]); 

  // Hàm lấy chi tiết phim theo ID - MỚI THÊM CHO BOOKING
  const loadMovieById = useCallback(async (movieId) => {
    if (!movieId) return null;

    setMovieLoading(true);
    setMovieError('');
    
    try {
      const movie = await fetchMovieById(movieId);
      const movieWithPoster = addPosterPath(movie);
      setCurrentMovie(movieWithPoster);
      return movieWithPoster;
    } catch (err) {
      console.error('Lỗi tải chi tiết phim:', err);
      setMovieError('Không thể tải thông tin phim.');
      setCurrentMovie(null);
      return null;
    } finally {
      setMovieLoading(false);
    }
  }, [addPosterPath]);

  // Hàm tìm phim trong danh sách đã load (alternative cho loadMovieById)
  const findMovieInLists = useCallback((movieId) => {
    const allLoadedMovies = [...nowShowing, ...comingSoon, ...allMovies];
    return allLoadedMovies.find(movie => movie.id == movieId) || null;
  }, [nowShowing, comingSoon, allMovies]);

  // Hàm tìm kiếm phim
  const searchMoviesByName = useCallback(async (query, filters = {}) => {
    if (!query && !Object.keys(filters).some(key => filters[key])) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    
    try {
      const results = await searchMovies(query, filters);
      setSearchResults(addPosterPath(results));
      return addPosterPath(results);
    } catch (err) {
      console.error('Lỗi tìm kiếm phim:', err);
      setSearchError('Không thể tìm kiếm phim.');
      setSearchResults([]);
      return [];
    } finally {
      setSearchLoading(false);
    }
  }, [addPosterPath]);

  // Hàm lấy tất cả phim
  const loadAllMovies = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const movies = await fetchAllMovies();
      const moviesWithPoster = addPosterPath(movies);
      setAllMovies(moviesWithPoster);
      return moviesWithPoster;
    } catch (err) {
      console.error('Lỗi tải tất cả phim:', err);
      setError('Không thể tải danh sách phim.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [addPosterPath]);

  // Hàm lấy phim với filters
  const loadMoviesWithFilters = useCallback(async (filters = {}) => {
    setLoading(true);
    setError('');
    
    try {
      const movies = await fetchMoviesWithFilters(filters);
      const moviesWithPoster = addPosterPath(movies);
      return moviesWithPoster;
    } catch (err) {
      console.error('Lỗi tải phim với filters:', err);
      setError('Không thể tải danh sách phim.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [addPosterPath]);

  // Hàm clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setSearchError('');
  }, []);

  // Hàm clear current movie
  const clearCurrentMovie = useCallback(() => {
    setCurrentMovie(null);
    setMovieError('');
  }, []);

  // Hàm refresh danh sách phim
  const refreshMovies = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const [now, soon] = await Promise.all([
        fetchNowShowingMovies(),
        fetchComingSoonMovies(),
      ]);

      setNowShowing(addPosterPath(now));
      setComingSoon(addPosterPath(soon));
    } catch (err) {
      console.error('Lỗi refresh phim:', err);
      setError('Không thể tải lại danh sách phim.');
    } finally {
      setLoading(false);
    }
  }, [addPosterPath]);
 
  return { 
    // Data states
    nowShowing, 
    comingSoon, 
    allMovies,
    searchResults,
    currentMovie, // Phim hiện tại đang được xem/booking
    
    // Loading states
    loading, 
    searchLoading,
    movieLoading, // Loading riêng cho 1 phim
    
    // Error states
    error,
    searchError,
    movieError, // Error riêng cho 1 phim
    
    // Functions
    searchMoviesByName,
    loadAllMovies,
    loadMoviesWithFilters,
    loadMovieById, // Hàm mới cho booking
    findMovieInLists, // Tìm phim trong danh sách đã load
    clearSearchResults,
    clearCurrentMovie, // Clear phim hiện tại
    refreshMovies,
  }; 
}; 
 
export default useMoviesUser;