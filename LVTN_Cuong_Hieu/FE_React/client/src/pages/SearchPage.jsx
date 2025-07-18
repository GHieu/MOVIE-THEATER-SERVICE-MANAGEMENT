import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useMoviesUser from '../hooks/useMovieUser';
import MovieCard from '../components/MovieHomepage/MovieCard';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();

  // Sử dụng hook useMovies
  const {
    allMovies,
    searchResults,
    loading,
    searchLoading,
    error,
    searchError,
    searchMoviesByName,
    loadAllMovies,
    clearSearchResults
  } = useMoviesUser();

  // Lấy query parameters từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search') || '';
    const type = params.get('type') || '';
    
    setSearchQuery(query);
    setSelectedType(type);
    
    fetchMovies(query, { type });
  }, [location.search]);

  const fetchMovies = async (query = '', filters = {}) => {
    try {
      if (query || Object.keys(filters).some(key => filters[key])) {
        await searchMoviesByName(query, filters);
      } else {
        await loadAllMovies();
        clearSearchResults();
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateURL(searchQuery, selectedType);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    updateURL(searchQuery, type);
  };

  const updateURL = (query, type) => {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (type) params.set('type', type);
    
    const newSearch = params.toString();
    navigate(`/movies${newSearch ? `?${newSearch}` : ''}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    navigate('/movies');
  };

  // Xác định danh sách phim hiển thị và trạng thái loading
  const displayMovies = (searchQuery || selectedType) ? searchResults : allMovies;
  const isLoading = (searchQuery || selectedType) ? searchLoading : loading;
  const currentError = (searchQuery || selectedType) ? searchError : error;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{currentError}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className=" px-5 py-1  font-semibold ">
        <span className="text-yellow-400 border-l-4 border-yellow-400 pl-2 text-2xl ">Kết quả tìm kiếm</span>
      </h2>
      <div className="container mx-auto px-4 ">

           
          
            
        

      {/* Movies Grid */}
      {displayMovies.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            {searchQuery || selectedType 
              ? 'Không tìm thấy phim nào phù hợp' 
              : 'Chưa có phim nào'}
          </div>
          {(searchQuery || selectedType) && (
            <button
              onClick={clearFilters}
              className="text-yellow-400 hover:text-yellow-500 underline"
            >
              Xem tất cả phim
            </button>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-5">
          {displayMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}