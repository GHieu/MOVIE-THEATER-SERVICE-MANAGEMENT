import React from 'react';
import useRooms from '../../hooks/useAdminRooms';

const AdminRooms = () => {
  const {
    editingRoom,
    setEditingRoom,
    handleUpdateRoom,
    handleInputChange,
    loading,
    error,
    currentRooms,
    currentPage,
    totalPages,
    goToPage,
    searchQuery,
    setSearchQuery,
    totalRoomsCount,
    filteredRoomsCount,
  } = useRooms();

  const handleCancel = () => {
    setEditingRoom(null);
  };

  return (
    <div className="p-4">
      {/* Phần thống kê và tìm kiếm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <p className="font-semibold">Tổng số phòng: {totalRoomsCount}</p>
          {searchQuery && (
            <p className="text-sm text-gray-600">Kết quả tìm: {filteredRoomsCount}</p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Không cần set thêm gì, searchQuery đã liên kết với input
          }}
          className="flex gap-2 w-full sm:w-1/2"
        >
          <input
            type="text"
            placeholder="Nhập tên phòng và nhấn Enter hoặc bấm Tìm"
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
        </form>
      </div>

      <h2 className="text-xl font-bold mb-4">Quản lý phòng chiếu</h2>

      {error && <p className="text-red-600">{error}</p>}

      {editingRoom && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <input
            name="name"
            value={editingRoom.name}
            onChange={handleInputChange}
            placeholder="Tên phòng"
            className="mb-2 p-2 border w-full"
          />
          <input
            name="type"
            value={editingRoom.type}
            onChange={handleInputChange}
            placeholder="Loại phòng (2D, 3D...)"
            className="mb-2 p-2 border w-full"
          />
          <input
            name="seat_count"
            value={editingRoom.seat_count}
            onChange={handleInputChange}
            placeholder="Số ghế"
            type="number"
            className="mb-2 p-2 border w-full"
          />
          <select
            name="status"
            value={Number(editingRoom.status)}
            onChange={handleInputChange}
            className="mb-2 p-2 border w-full"
          >
            <option value={1}>Đang hoạt động</option>
            <option value={0}>Tạm dừng</option>
            <option value={2}>Đang bảo trì</option>
          </select>

          <div className="space-x-2">
            <button
              onClick={handleUpdateRoom}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Cập nhật
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

      {!loading && currentRooms.length > 0 ? (
        <>
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Tên phòng</th>
                <th className="border p-2">Loại</th>
                <th className="border p-2">Số ghế</th>
                <th className="border p-2">Trạng thái</th>
                <th className="border p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentRooms.map((room) => (
                <tr key={room.id}>
                  <td className="border p-2">{room.name}</td>
                  <td className="border p-2">{room.type}</td>
                  <td className="border p-2">{room.seat_count}</td>
                  <td className="border p-2">{room.statusLabel}</td>
                  <td className="border p-2">
                    <button
                      className="text-blue-600"
                      onClick={() => setEditingRoom(room)}
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Phân trang */}
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
            ? 'Không tìm thấy phòng nào phù hợp.'
            : 'Không có phòng nào.'}
        </p>
      )}
    </div>
  );
};

export default AdminRooms;
