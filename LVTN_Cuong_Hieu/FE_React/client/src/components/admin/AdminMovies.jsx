import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { format, addDays, addYears, isAfter, isBefore } from 'date-fns';
import { vi } from 'date-fns/locale';
import useMovies from '../../hooks/Admin/useAdminMovies';
import { Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, RefreshCw, Clock, Eye, EyeOff, Play, Calendar } from "lucide-react";

// Import CSS cho react-date-range
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const AdminMovies = () => {
  const {
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
    searchQuery,
    handleSearch,
    clearSearch,
    currentPage,
    totalPages,
    totalMoviesCount,
    currentMoviesCount,
    showingFrom,
    showingTo,
    goToPage,
  } = useMovies();

  const [isAdding, setIsAdding] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [lastAutoUpdate, setLastAutoUpdate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const movieData = editingMovie || newMovie;

  // Date range state
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 30),
      key: 'selection'
    }
  ]);

  // Update date range when editing a movie
  useEffect(() => {
    if (movieData) {
      const startDate = movieData.release_date ? new Date(movieData.release_date) : new Date();
      const endDate = movieData.end_date ? new Date(movieData.end_date) : addDays(startDate, 30);
      
      setDateRange([{
        startDate,
        endDate,
        key: 'selection'
      }]);
    }
  }, [movieData?.release_date, movieData?.end_date]);

  // Auto-refresh movies every 5 minutes to check for status updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing movies for status update check...');
      // This will trigger the auto-update logic in useMovies
      goToPage(currentPage);
      setLastAutoUpdate(new Date());
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [currentPage, goToPage]);

  // Handle date range change
  const handleDateRangeChange = (ranges) => {
    setDateRange([ranges.selection]);
    
    // Update the movie data with formatted dates
    const startDate = format(ranges.selection.startDate, 'yyyy-MM-dd');
    const endDate = format(ranges.selection.endDate, 'yyyy-MM-dd');
    
    // Create synthetic events for handleInputChange
    const releaseEvent = {
      target: {
        name: 'release_date',
        value: startDate
      }
    };
    
    const endEvent = {
      target: {
        name: 'end_date',
        value: endDate
      }
    };
    
    handleInputChange(releaseEvent);
    handleInputChange(endEvent);
  };

  const handleFormSubmit = async (e) => {
  e.preventDefault(); // Prevent default form submission
  
  // Custom validation before sending to API
  const requiredFields = ['title', 'duration', 'genre', 'director', 'studio', 'age', 'type', 'release_date', 'end_date'];
  const missingFields = requiredFields.filter(field => !movieData[field] || movieData[field].toString().trim() === '');
  
  if (missingFields.length > 0) {
    alert(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`);
    return;
  }
  
  // Additional custom validation
  if (movieData.duration < 30 || movieData.duration > 300) {
    alert('Thời lượng phim phải từ 30 đến 300 phút');
    return;
  }
  
  if (new Date(movieData.end_date) <= new Date(movieData.release_date)) {
    alert('Ngày kết thúc phải sau ngày khởi chiếu');
    return;
  }
  
  console.log('Form submit with data:', movieData);
  
  try {
    if (editingMovie) {
      await handleUpdateMovie();
    } else {
      await handleAddMovie();
      setIsAdding(false);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    // Handle API errors here
  }
};
  
  const handleCancel = () => {
    setIsAdding(false);
    setEditingMovie(null);
    setNewMovie({
      title: '', description: '', duration: '', genre: '',
      director: '', cast: '', nation: '', poster: '', banner: '',
      trailer_url: '', release_date: '', end_date: '',
      status: 0, age: '', type: '', studio: ''
    });
    setDateRange([{
      startDate: new Date(),
      endDate: addDays(new Date(), 30),
      key: 'selection'
    }]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    clearSearch();
  };

  const handleManualRefresh = () => {
    console.log('Manual refresh triggered...');
    goToPage(currentPage);
    setLastAutoUpdate(new Date());
  };

  // Get current date for comparison
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };
  
  // Hàm lấy ngày hiện tại theo múi giờ Việt Nam
  const getCurrentDateVN = () => {
    const now = new Date();
    // Convert to Vietnam timezone (UTC+7)
    const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return vnTime.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Hàm so sánh chỉ ngày, bỏ qua giờ
  const compareDatesOnly = (date1, date2) => {
    const d1 = new Date(date1 + 'T00:00:00');
    const d2 = new Date(date2 + 'T00:00:00');
    
    return d1.getTime() - d2.getTime();
  };

  // Check if movie status might need update based on dates
  const getMovieStatusInfo = (movie) => {
    const today = getCurrentDateVN(); // Sử dụng múi giờ Việt Nam
    const releaseDate = movie.release_date;
    const endDate = movie.end_date;
    
    // Debug log
    console.log('Movie:', movie.title, {
      today,
      releaseDate,
      endDate,
      currentType: movie.type,
      currentStatus: movie.status,
      vnTime: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      releaseDateComp: releaseDate ? compareDatesOnly(releaseDate, today) : null,
      endDateComp: endDate ? compareDatesOnly(endDate, today) : null
    });
    
    if (!releaseDate) return { needsAttention: false, message: '' };
    
    // So sánh ngày
    const releaseDateComp = compareDatesOnly(releaseDate, today);
    const endDateComp = endDate ? compareDatesOnly(endDate, today) : null;
    
    // Case 1: Movie has ended (end_date < today) - should be stop_showing and hidden
    if (endDateComp !== null && endDateComp < 0 && (movie.type !== 'stop_showing' || movie.status !== 0)) {
      return { 
        needsAttention: true, 
        message: 'Phim đã kết thúc chiếu nhưng chưa cập nhật trạng thái',
        suggestedType: 'stop_showing',
        suggestedStatus: 0
      };
    }
    
    // Case 2: Movie is currently showing (release_date <= today <= end_date or no end_date)
    if (releaseDateComp <= 0 && (endDateComp === null || endDateComp >= 0)) {
      if (movie.type !== 'now_showing' || movie.status !== 1) {
        return { 
          needsAttention: true, 
          message: 'Phim đang trong thời gian chiếu nhưng chưa cập nhật trạng thái',
          suggestedType: 'now_showing',
          suggestedStatus: 1
        };
      }
    }
    
    // Case 3: Movie is coming soon (release_date > today) - should be coming_soon and visible  
    if (releaseDateComp > 0 && (movie.type !== 'coming_soon' || movie.status !== 1)) {
      return { 
        needsAttention: true, 
        message: 'Phim chưa khởi chiếu nhưng chưa cập nhật trạng thái',
        suggestedType: 'coming_soon',
        suggestedStatus: 1
      };
    }
    
    return { needsAttention: false, message: '' };
  };
  
  // Count movies that need attention
  const moviesNeedingAttention = movies.filter(movie => getMovieStatusInfo(movie).needsAttention);

  // Tạo array cho pagination buttons
  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const paginationRange = getPaginationRange();

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý phim</h2>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <span>Tổng: {totalMoviesCount} phim</span>
            {totalMoviesCount > 0 && (
              <span>
                Hiển thị {showingFrom}-{showingTo} của {totalMoviesCount}
              </span>
            )}
            {moviesNeedingAttention.length > 0 && (
              <span className="text-amber-600 font-medium">
                ⚠️ {moviesNeedingAttention.length} phim cần cập nhật trạng thái
              </span>
            )}
          </div>
          {lastAutoUpdate && (
            <div className="text-xs text-gray-500 mt-1">
              Cập nhật cuối: {lastAutoUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleManualRefresh}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            title="Làm mới và kiểm tra trạng thái phim"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 px-4 py-2 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            onClick={() => {
              setIsAdding(true);
              setEditingMovie(null);
            }}
          >
            <span>+</span>
            Thêm phim
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {moviesNeedingAttention.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Cần cập nhật trạng thái phim
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>Có {moviesNeedingAttention.length} phim cần được cập nhật trạng thái tự động dựa trên ngày chiếu.</p>
                <p className="mt-1 text-xs">Hệ thống sẽ tự động cập nhật khi bạn làm mới trang.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Nhập tên phim để tìm kiếm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Tìm
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 rounded-lg transition-colors duration-200"
            >
              <X size={18} />
            </button>
          )}
        </form>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            Tìm thấy {currentMoviesCount} kết quả cho "{searchQuery}"
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form thêm / chỉnh sửa */}
      {(isAdding || editingMovie) && movieData && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {editingMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
          </h3>
          <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'title', placeholder: 'Tên phim *', label: 'Tên phim', required: true },
              { name: 'duration', placeholder: 'Thời lượng (phút) *', label: 'Thời lượng', type: 'number', required: true },
              { name: 'genre', placeholder: 'Thể loại *', label: 'Thể loại', required: true },
              { name: 'director', placeholder: 'Đạo diễn *', label: 'Đạo diễn', required: true },
              { name: 'studio', placeholder: 'Nhà sản xuất *', label: 'Nhà sản xuất', required: true},
              { name: 'cast', placeholder: 'Diễn viên', label: 'Diễn viên', required: false },
              { name: 'nation', placeholder: 'Quốc gia', label: 'Quốc gia', required: false },
            ].map((field) => (
              <div key={field.name} className="mb-4">
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || 'text'}
                  value={movieData[field.name] || ''}
                  onChange={handleInputChange}   
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          
          <textarea
            name="description"
            value={movieData.description || ''}
            onChange={handleInputChange}
            placeholder="Mô tả phim"
            rows="3"
            className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới hạn độ tuổi *
              </label>
              <select
                name="age"
                value={movieData.age || ''}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Chọn độ tuổi --</option>
                <option value="P">P - Phù hợp mọi lứa tuổi</option>
                <option value="T13">T13 - Trên 13 tuổi</option>
                <option value="T16">T16 - Trên 16 tuổi</option>
                <option value="T18">T18 - Trên 18 tuổi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại chiếu *
              </label>
              <select
                name="type"
                value={movieData.type || ''}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Chọn loại --</option>
                <option value="now_showing">Đang chiếu</option>
                <option value="coming_soon">Sắp chiếu</option>
                <option value="stop_showing">Đã kết thúc</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái hiển thị
              </label>
              <select
                name="status"
                value={Number(movieData.status) || 0}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Ẩn</option>
                <option value={1}>Hiển thị</option>
              </select>
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian chiếu *
              <span className="text-red-500 ml-1">*</span>
            </label>
            
            {/* Display selected dates */}
            <div className="flex items-center gap-4 mb-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" />
                <span className="text-sm text-gray-700">
                  <strong>Khởi chiếu:</strong> {movieData.release_date ? format(new Date(movieData.release_date), 'dd/MM/yyyy', { locale: vi }) : 'Chưa chọn'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-red-600" />
                <span className="text-sm text-gray-700">
                  <strong>Kết thúc:</strong> {movieData.end_date ? format(new Date(movieData.end_date), 'dd/MM/yyyy', { locale: vi }) : 'Chưa chọn'}
                </span>
              </div>
            </div>

            {/* Date picker toggle button */}
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
            >
              <span className="text-gray-700">
                {movieData.release_date && movieData.end_date
                  ? `${format(new Date(movieData.release_date), 'dd/MM/yyyy')} - ${format(new Date(movieData.end_date), 'dd/MM/yyyy')}`
                  : 'Chọn khoảng thời gian chiếu'
                }
              </span>
              <Calendar size={16} className="text-gray-400" />
            </button>

            {/* Date Range Picker */}
            {showDatePicker && (
              <div className="mt-2 border border-gray-300 rounded-lg bg-white shadow-lg">
                <DateRange
                  ranges={dateRange}
                  onChange={handleDateRangeChange}
                  locale={vi}
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 365)}
                  editableDateInputs={true}
                  moveRangeOnFirstSelection={false}
                  rangeColors={['#3b82f6']}
                  className="w-full"
                />
                <div className="p-3 border-t bg-gray-50 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              Chọn ngày khởi chiếu và ngày kết thúc. Hệ thống sẽ tự động cập nhật trạng thái phim dựa trên thời gian này.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poster
              </label>
              <input
                type="file"
                name="poster"
                onChange={handleInputChange}
                accept="image/*"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {movieData.poster && typeof movieData.poster === 'string' && (
                <img src={movieData.poster} alt="Poster" className="w-32 h-auto mt-2 rounded-lg shadow" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner
              </label>
              <input
                type="file"
                name="banner"
                onChange={handleInputChange}
                accept="image/*"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {movieData.banner && typeof movieData.banner === 'string' && (
                <img src={movieData.banner} alt="Banner" className="w-48 h-auto mt-2 rounded-lg shadow" />
              )}
            </div>
          </div>
       
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trailer Video
            </label>
            <input
              type="file"
              name="trailer_url"
              onChange={handleInputChange}
              accept="video/mp4,video/quicktime,video/x-matroska"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {movieData.trailer_url && typeof movieData.trailer_url === 'string' && (
              <div className="mt-2">
                <video controls className="w-64 h-auto rounded-lg shadow">
                  <source src={movieData.trailer_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleFormSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              {editingMovie ? 'Cập nhật' : 'Thêm phim'}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Hủy
            </button>
          </div>
          </form>
        </div>
      )}

      {/* Bảng dữ liệu */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      ) : movies.length > 0 ? (
        <>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thông tin phim
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hình ảnh
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chi tiết & Thời gian
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movies.map((movie) => {
                    const statusInfo = getMovieStatusInfo(movie);
                    return (
                      <tr key={movie.id} className={`hover:bg-gray-50 ${statusInfo.needsAttention ? 'bg-amber-50' : ''}`}>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {movie.title}
                              {statusInfo.needsAttention && (
                                <span className="text-amber-500" title={statusInfo.message}>
                                  ⚠️
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{movie.genre}</div>
                            <div className="text-sm text-gray-500">{movie.duration} phút</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            {movie.poster && (
                              <img
                                src={movie.poster}
                                alt="Poster"
                                className="w-12 h-16 object-cover rounded shadow"
                              />
                            )}
                            {movie.banner && (
                              <img
                                src={movie.banner}
                                alt="Banner"
                                className="w-20 h-12 object-cover rounded shadow"
                              />
                            )}
                            {movie.trailer_url && (
                            <div className="flex items-center text-blue-600">
                              <Play size={16} />
                              <span className="text-xs ml-1">Video</span>
                            </div>
                          )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 space-y-1">
                            <div>Quốc gia: {movie.nation}</div>
                            <div>Đạo diễn: {movie.director}</div>
                            <div>Nhà sản xuất: {movie.studio}</div>
                            <div>Độ tuổi: {movie.age}</div>
                            <div className="text-blue-600 font-medium">
                              Khởi chiếu: {movie.release_date}
                            </div>
                            {movie.end_date && (
                              <div className="text-red-600 font-medium">
                                Kết thúc: {movie.end_date}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            {/* Loại chiếu */}
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              movie.type === 'now_showing'
                                ? 'bg-green-100 text-green-800' 
                                : movie.type === 'coming_soon'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {movie.typeLabel}
                            </span>
                            
                            {/* Trạng thái hiển thị */}
                            <div className="flex items-center gap-1">
                              {movie.status === 1 ? (
                                <Eye size={12} className="text-green-600" />
                              ) : (
                                <EyeOff size={12} className="text-red-600" />
                              )}
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                movie.status === 1 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {movie.statusLabel}
                              </span>
                            </div>
                            
                            {/* Warning message */}
                            {statusInfo.needsAttention && (
                              <div className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
                                {statusInfo.message}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-800 p-1"
                              onClick={() => {
                                console.log('Editing movie:', movie);
                                setEditingMovie(movie);
                                setIsAdding(false);
                              }}
                              title="Chỉnh sửa"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 p-1"
                              onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
                                  handleDeleteMovie(movie.id);
                                }
                              }}
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="text-sm text-gray-700">
                Hiển thị {showingFrom} đến {showingTo} trong tổng số {totalMoviesCount} phim
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Trước
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {paginationRange.map((page, index) => (
                    page === '...' ? (
                      <span key={`dots-${index}`} className="px-3 py-2 text-sm text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  Sau
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-gray-500">
            {searchQuery ? (
              <>
                <div className="text-lg mb-2">Không tìm thấy phim nào</div>
                <div className="text-sm">Không có phim nào phù hợp với từ khóa "{searchQuery}"</div>
                <button
                  onClick={handleClearSearch}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </>
            ) : (
              <>
                <div className="text-lg mb-2">Chưa có phim nào</div>
                <div className="text-sm mb-4">Hãy thêm phim đầu tiên của bạn</div>
                <button
                  onClick={() => {
                    setIsAdding(true);
                    setEditingMovie(null);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Thêm phim đầu tiên
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMovies;