import React, { useState, useEffect } from 'react';
import useAdminSeats from '../../hooks/Admin/useAdminSeats';
import useRooms from '../../hooks/Admin/useAdminRooms';

const AdminSeats = () => {
  const { rooms } = useRooms();
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const {
    seats,
    seatTypeCount,
    loading,
    error,
    editingSeat,
    setEditingSeat,
    handleUpdateSeat,
    handleAutoSetType,
    fetchSeatsForRoom,
    loadSeatTypeCount,
  } = useAdminSeats();

  // Load ghế khi phòng được chọn
  useEffect(() => {
    if (selectedRoomId) {
      fetchSeatsForRoom(selectedRoomId);
    }
  }, [selectedRoomId]);

  const [editForm, setEditForm] = useState({
    seat_type: '',
    price: '',
    status: '',
  });

  const handleEditClick = (seat) => {
    setEditingSeat(seat.id);
    setEditForm({
      seat_type: seat.seat_type,
      price: seat.price,
      status: seat.status,
    });
  };

  const handleSave = async () => {
    await handleUpdateSeat(editingSeat, editForm);
    // API sẽ tự động cập nhật số lượng loại ghế
    if (selectedRoomId) {
      await loadSeatTypeCount(selectedRoomId);
    }
  };



  // Sắp xếp ghế theo hàng và số ghế
  const organizeSeats = () => {
    const seatsByRow = {};
    seats.forEach(seat => {
      if (!seatsByRow[seat.seat_row]) {
        seatsByRow[seat.seat_row] = [];
      }
      seatsByRow[seat.seat_row].push(seat);
    });

    // Sắp xếp theo thứ tự hàng (A, B, C...) và số ghế
    Object.keys(seatsByRow).forEach(row => {
      seatsByRow[row].sort((a, b) => a.seat_number - b.seat_number);
    });

    return Object.keys(seatsByRow)
      .sort()
      .map(row => ({
        row,
        seats: seatsByRow[row]
      }));
  };

  // Lấy class CSS cho ghế dựa trên loại và trạng thái
  const getSeatClass = (seat) => {
    // Base class với chiều rộng động
    const baseClass = `${seat.seat_type === 'couple' ? 'w-20' : 'w-10'} h-10 m-1 rounded-lg border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-200 hover:scale-105`;
    
    // Xử lý trạng thái ghế trước (có priority cao hơn)
    if (seat.status === 'reversed') {
      return `${baseClass} bg-red-200 border-red-400 text-red-800 opacity-75`;
    }
    
    if (seat.status === 'broken') {
      return `${baseClass} bg-gray-300 border-gray-500 text-gray-600 opacity-50 cursor-not-allowed`;
    }
    
    // Màu sắc theo loại ghế (khi ghế available)
    switch(seat.seat_type) {
      case 'couple':
        return `${baseClass} bg-pink-100 border-pink-400 text-pink-800 hover:bg-pink-200`;
      case 'vip':
        return `${baseClass} bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200`;
      default: // standard
        return `${baseClass} bg-blue-100 border-blue-400 text-blue-800 hover:bg-blue-200`;
    }
  };

  const organizedSeats = organizeSeats();

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedRoomId ? `Quản lý ghế phòng #${selectedRoomId}` : 'Chọn phòng để xem ghế'}
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedRoomId || ''}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
            
            {selectedRoomId && (
              <button
                onClick={() => handleAutoSetType(selectedRoomId)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Tự động gán loại ghế
              </button>
            )}
          </div>
        </div>

        {/* Thống kê loại ghế */}
        {seatTypeCount.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-6">
            {seatTypeCount.map((type) => (
              <div
                key={type.seat_type}
                className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 rounded-lg shadow-sm border"
              >
                <div className="text-sm font-medium text-gray-600">
                  {type.seat_type.toUpperCase()}
                </div>
                <div className="text-xl font-bold text-gray-800">
                  {type.total} ghế
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-gray-600">Đang tải danh sách ghế...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Layout rạp chiếu phim */}
      {seats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          {/* Màn hình */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-8 rounded-lg inline-block shadow-lg">
              <div className="text-lg font-bold">MÀN HÌNH</div>
            </div>
          </div>

          {/* Chú thích */}
          <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
              <span>Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
              <span>VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-pink-100 border-2 border-pink-400 rounded flex items-center justify-center text-xs">💕</div>
              <span>Couple</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded opacity-50"></div>
              <span>Đã đặt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded opacity-30"></div>
              <span>Hỏng</span>
            </div>
          </div>

          {/* Sơ đồ ghế */}
          <div className="space-y-2 max-w-4xl mx-auto">
            {organizedSeats.map(({ row, seats: rowSeats }) => (
              <div key={row} className="flex items-center justify-center">
                {/* Nhãn hàng */}
                <div className="w-8 h-10 flex items-center justify-center font-bold text-gray-600 mr-4">
                  {row}
                </div>
                
                {/* Ghế trong hàng */}
                <div className="flex">
                  {rowSeats.map((seat, index) => (
                    <div
                      key={seat.id}
                      className={getSeatClass(seat)}
                      onClick={() => handleEditClick(seat)}
                      title={`Ghế ${seat.seat_row}${seat.seat_number} - ${seat.seat_type} - ${seat.price?.toLocaleString()} VND`}
                    >
                      {seat.seat_type === 'couple' ? (
                        <span className="text-xs">
                          {seat.seat_number}
                          <br />
                          COUPLE
                        </span>
                      ) : (
                        seat.seat_number
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Nhãn hàng bên phải */}
                <div className="w-8 h-10 flex items-center justify-center font-bold text-gray-600 ml-4">
                  {row}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form chỉnh sửa ghế */}
      {editingSeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              Chỉnh sửa ghế {seats.find(s => s.id === editingSeat)?.seat_row}{seats.find(s => s.id === editingSeat)?.seat_number}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại ghế
                </label>
                <select
                  value={editForm.seat_type}
                  onChange={(e) => setEditForm({ ...editForm, seat_type: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="vip">VIP</option>
                  <option value="couple">Couple</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá vé (VND)
                </label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) })}
                  placeholder="Giá vé"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">Có thể đặt</option>
                  <option value="reversed">Đã đặt</option>
                  <option value="broken">Hỏng</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Lưu thay đổi
                </button>
                <button
                  onClick={() => setEditingSeat(null)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSeats;