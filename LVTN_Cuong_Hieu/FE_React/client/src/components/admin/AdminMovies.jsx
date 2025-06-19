import React, { useState } from 'react';
import useMovies from '../../hooks/Admin/useAdminMovies';
import { Pencil, Trash2, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

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
  const movieData = editingMovie || newMovie;

  const handleFormSubmit = async () => {
    console.log('Form submit with data:', movieData); // Debug log
    if (editingMovie) {
      await handleUpdateMovie();
    } else {
      await handleAddMovie();
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingMovie(null);
    setNewMovie({
      title: '', description: '', duration: '', genre: '',
      director: '', cast: '', poster: '', banner: '',
      trailer_url: '', release_date: '', end_date: '',
      status: 0, age: '', type: ''
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    clearSearch();
  };

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
          </div>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'title', placeholder: 'Tên phim *', required: true },
              { name: 'duration', placeholder: 'Thời lượng (phút) *', type: 'number', required: true },
              { name: 'genre', placeholder: 'Thể loại *', required: true },
              { name: 'director', placeholder: 'Đạo diễn *', required: true },
              { name: 'cast', placeholder: 'Diễn viên', required: false },
              { name: 'trailer_url', placeholder: 'Trailer URL', required: false },
            ].map((field) => (
              <input
                key={field.name}
                name={field.name}
                type={field.type || 'text'}
                value={movieData[field.name] || ''}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                required={field.required}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày khởi chiếu
              </label>
              <input
                type="date"
                name="release_date"
                value={movieData.release_date || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                name="end_date"
                value={movieData.end_date || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
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
                      Chi tiết
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
                  {movies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{movie.title}</div>
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
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          <div>Đạo diễn: {movie.director}</div>
                          <div>Độ tuổi: {movie.age}</div>
                          <div>Khởi chiếu: {movie.release_date}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          
                          {/* Loại chiếu */}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            movie.type === 'now_showing'
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {movie.typeLabel}
                          </span>
                          {/* Trạng thái hiển thị */}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            movie.status === 1 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {movie.statusLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-800 p-1"
                            onClick={() => {
                              console.log('Editing movie:', movie); // Debug log
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
                  ))}
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