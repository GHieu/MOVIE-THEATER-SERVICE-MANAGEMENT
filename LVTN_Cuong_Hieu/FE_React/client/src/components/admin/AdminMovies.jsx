import React, { useState } from 'react';
import useMovies from '../../hooks/useAdminMovies';

const AdminMovies = () => {
  const {
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
    setSearchQuery,
    totalMoviesCount,
    filteredMoviesCount,
    currentMovies,
    currentPage,
    totalPages,
    goToPage,
  } = useMovies();

  const [isAdding, setIsAdding] = useState(false);
  const movieData = editingMovie || newMovie;

  const handleFormSubmit = async () => {
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
      director: '', cast: '', poster: '', trailer_url: '',
      release_date: '', end_date: '', status: false
    });
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <p className="font-semibold">Tổng số phim: {totalMoviesCount}</p>
          {searchQuery && (
            <p className="text-sm text-gray-600">Kết quả tìm: {filteredMoviesCount}</p>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-1/2">
          <input
            type="text"
            placeholder="Nhập tên phim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
           <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tìm
          </button>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý phim</h2>
        <button
          className="bg-green-600 px-4 py-2 text-white rounded"
          onClick={() => {
            setIsAdding(true);
            setEditingMovie(null);
          }}
        >
          Thêm phim
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {(isAdding || editingMovie) && movieData && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          {[
            { name: 'title', placeholder: 'Tên phim' },
            { name: 'description', placeholder: 'Mô tả' },
            { name: 'duration', placeholder: 'Thời lượng (phút)' },
            { name: 'genre', placeholder: 'Thể loại' },
            { name: 'director', placeholder: 'Đạo diễn' },
            { name: 'cast', placeholder: 'Diễn viên' },
            { name: 'trailer_url', placeholder: 'Trailer URL' },
          ].map((field) => (
            <input
              key={field.name}
              name={field.name}
              value={movieData[field.name] || ''}
              onChange={handleInputChange}
              placeholder={field.placeholder}
              className="mb-2 p-2 border w-full"
            />
          ))}

          <input
            type="file"
            name="poster"
            onChange={handleInputChange}
            className="mb-2 p-2 border w-full"
          />

          {movieData.poster && typeof movieData.poster === 'string' && (
            <img src={movieData.poster} alt="Poster" className="w-32 h-auto mb-2" />
          )}

          <input
            type="date"
            name="release_date"
            value={movieData.release_date || ''}
            onChange={handleInputChange}
            className="mb-2 p-2 border w-full"
          />
          <input
            type="date"
            name="end_date"
            value={movieData.end_date || ''}
            onChange={handleInputChange}
            className="mb-2 p-2 border w-full"
          />
          <select
            name="status"
            value={Number(movieData.status)}
            onChange={handleInputChange}
            className="mb-2 p-2 border w-full"
          >
            <option value={0}>Sắp chiếu</option>
            <option value={1}>Đang chiếu</option>
          </select>

          <div className="space-x-2">
            <button
              onClick={handleFormSubmit}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              {editingMovie ? 'Cập nhật' : 'Thêm'}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 text-white px-3 py-1 rounded"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {!loading && currentMovies.length > 0 ? (
        <>
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Tên phim</th>
                <th className="border p-2">Thể loại</th>
                <th className="border p-2">Thời lượng</th>
                <th className="border p-2">Poster</th>
                <th className="border p-2">Trạng thái</th>
                <th className="border p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentMovies.map((movie) => (
                <tr key={movie.id}>
                  <td className="border p-2">{movie.title}</td>
                  <td className="border p-2">{movie.genre}</td>
                  <td className="border p-2">{movie.duration} phút</td>
                  <td className="border p-2">
                    {movie.poster && (
                      <img
                        src={movie.poster}
                        alt="Poster"
                        className="w-40 h-auto rounded shadow hover:scale-105 transition duration-200"
                      />
                    )}
                  </td>
                  <td className="border p-2">{movie.statusLabel}</td>
                  <td className="border p-2 space-x-2">
                    <button
                      className="text-blue-600"
                      onClick={() => {
                        setEditingMovie(movie);
                        setIsAdding(false);
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDeleteMovie(movie.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center mt-4 space-x-2">
            <button
              className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo;
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`px-3 py-1 border rounded ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
                onClick={() => goToPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button
              className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &raquo;
            </button>
          </div>
        </>
      ) : loading ? (
        <p className="text-center text-gray-600 mt-4">Đang tải...</p>
      ) : (
        <p className="text-center text-gray-600 mt-4">
          {searchQuery
            ? 'Không tìm thấy phim nào phù hợp.'
            : 'Không có phim nào.'}
        </p>
      )}
    </div>
  );
};

export default AdminMovies;
