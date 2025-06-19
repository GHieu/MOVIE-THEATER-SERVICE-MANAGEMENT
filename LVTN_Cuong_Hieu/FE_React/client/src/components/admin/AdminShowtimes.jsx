import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import useShowtimes from '../../hooks/Admin/useAdminShowtimes';

const AdminShowtimes = () => {
  const {
    movieOptions,
    roomOptions,
    newShowtime,
    editingShowtime,
    loading,
    error,
    setEditingShowtime,
    setNewShowtime,
    handleAddShowtime,
    handleUpdateShowtime,
    handleDeleteShowtime,
    handleInputChange,
    searchQuery,
    setSearchQuery,
    currentShowtimes,
    currentPage,
    totalPages,
    goToPage,
    totalShowtimeCount,
    filteredShowtimeCount,
  } = useShowtimes();

  const [isAdding, setIsAdding] = useState(false);
  const showtimeData = editingShowtime || newShowtime;

  const handleFormSubmit = async () => {
    // Validate required fields
    if (!showtimeData.movie_id || !showtimeData.room_id || !showtimeData.start_time || !showtimeData.end_time || !showtimeData.price) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }

    if (editingShowtime) {
      await handleUpdateShowtime();
      setEditingShowtime(null);
    } else {
      await handleAddShowtime();
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingShowtime(null);
    setNewShowtime({
      movie_id: '',
      room_id: '',
      promotion_id: '',
      start_time: '',
      end_time: '',
      price: '',
    });
  };

  const handleEdit = (showtime) => {
    // Format datetime for input fields
    const formatDatetime = (datetime) => {
      if (!datetime) return '';
      const date = new Date(datetime);
      return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format
    };

    setEditingShowtime({
      ...showtime,
      start_time: formatDatetime(showtime.start_time),
      end_time: formatDatetime(showtime.end_time),
    });
    setIsAdding(false);
  };

  return (
    <div className="p-4">
      {/* Tìm kiếm và tổng số */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <div>
          <p className="font-semibold">
            {searchQuery ? (
              <>
                Kết quả tìm kiếm: {filteredShowtimeCount} 
                <span className="text-sm text-gray-600 ml-2">
                  (Tổng: {totalShowtimeCount})
                </span>
              </>
            ) : (
              `Tổng suất chiếu: ${totalShowtimeCount}`
            )}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-1/2">
          <input
            type="text"
            placeholder="Tìm theo tên phim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* Tiêu đề + Thêm */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý suất chiếu</h2>
        <button
          className="bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700"
          onClick={() => {
            setIsAdding(true);
            setEditingShowtime(null);
          }}
        >
          Thêm suất chiếu
        </button>
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Form thêm / chỉnh sửa */}
      {(isAdding || editingShowtime) && showtimeData && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h3 className="text-lg font-semibold mb-3">
            {editingShowtime ? 'Chỉnh sửa suất chiếu' : 'Thêm suất chiếu mới'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phim *</label>
              <select
                name="movie_id"
                value={showtimeData.movie_id || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">-- Chọn phim --</option>
                {Array.isArray(movieOptions) && movieOptions.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phòng *</label>
              <select
                name="room_id"
                value={showtimeData.room_id || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">-- Chọn phòng --</option>
                {Array.isArray(roomOptions) && roomOptions.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ID Khuyến mãi</label>
              <input
                type="number"
                name="promotion_id"
                value={showtimeData.promotion_id || ''}
                onChange={handleInputChange}
                placeholder="ID Khuyến mãi (tùy chọn)"
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Giá vé *</label>
              <input
                type="number"
                name="price"
                value={showtimeData.price || ''}
                onChange={handleInputChange}
                placeholder="Giá vé"
                className="w-full p-2 border rounded"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Thời gian bắt đầu *</label>
              <input
                type="datetime-local"
                name="start_time"
                value={showtimeData.start_time || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Thời gian kết thúc *</label>
              <input
                type="datetime-local"
                name="end_time"
                value={showtimeData.end_time || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleFormSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingShowtime ? 'Cập nhật' : 'Thêm'}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Bảng suất chiếu */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Đang tải...</p>
        </div>
      ) : currentShowtimes.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border border-collapse text-center">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Tên phim</th>
                  <th className="border p-2">Phòng</th>
                  <th className="border p-2">Khuyến mãi</th>
                  <th className="border p-2">Bắt đầu</th>
                  <th className="border p-2">Kết thúc</th>
                  <th className="border p-2">Giá vé</th>
                  <th className="border p-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentShowtimes.map((showtime) => (
                  <tr key={showtime.id} className="hover:bg-gray-50">
                    <td className="border p-2">
                      {showtime.movie?.title || `Phim #${showtime.movie_id}`}
                    </td>
                    <td className="border p-2">
                      {showtime.room?.name || `Phòng #${showtime.room_id}`}
                    </td>
                    <td className="border p-2">
                      {showtime.promotion?.name || 
                       (showtime.promotion_id ? `KM #${showtime.promotion_id}` : 'Không có')}
                    </td>
                    <td className="border p-2">
                      {new Date(showtime.start_time).toLocaleString('vi-VN')}
                    </td>
                    <td className="border p-2">
                      {new Date(showtime.end_time).toLocaleString('vi-VN')}
                    </td>
                    <td className="border p-2">
                      {Number(showtime.price).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="border p-2">
                      <div className="flex justify-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 p-1"
                          onClick={() => handleEdit(showtime)}
                          title="Chỉnh sửa"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 p-1"
                          onClick={() => handleDeleteShowtime(showtime.id)}
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <button
                className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &laquo; Trước
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Show first page, last page, current page, and pages around current page
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-1 border rounded ${
                        currentPage === pageNum 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="px-2">...</span>;
                }
                return null;
              })}

              <button
                className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau &raquo;
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {searchQuery ? 'Không tìm thấy suất chiếu nào.' : 'Không có suất chiếu nào.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminShowtimes;