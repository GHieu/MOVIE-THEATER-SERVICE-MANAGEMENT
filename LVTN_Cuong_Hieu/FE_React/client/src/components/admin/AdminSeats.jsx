import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useAdminSeats from '../../hooks/Admin/useAdminSeats';
import useRooms from '../../hooks/Admin/useAdminRooms';

const AdminSeats = () => {
  const { rooms } = useRooms();
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRoomName, setSelectedRoomName] = useState('');
  const [activeShowtimeId, setActiveShowtimeId] = useState(null);

  const {
    seats,
    seatTypeCount,
    selectedDateShowtimes, // Sử dụng selectedDateShowtimes thay vì todayShowtimes
    selectedDate, // Lấy selectedDate từ hook
    loading,
    error,
    editingSeat,
    setEditingSeat,
    setSeatTypeCount,
    fetchSeatsForRoom,
    handleUpdateSeat,
    handleAutoSetType,
    loadSeatTypeCount,
    calculateSeatTypeCountFromSeats,
    fetchShowtimesByDate, // Sử dụng fetchShowtimesByDate thay vì fetchTodayShowtimes
    handleDateChange, // Sử dụng hàm handleDateChange từ hook
    fetchSeatsFromShowtime,
    formatTime,
    getShowtimeStatus,
    setSelectedDate,
  } = useAdminSeats();

  const [editForm, setEditForm] = useState({
    seat_type: '',
    price: '',
    status: '',
  });

  // Load ghế và suất chiếu khi phòng được chọn
  useEffect(() => {
    if (selectedRoomId) {
      console.log('Room changed, loading data for room:', selectedRoomId, 'date:', selectedDate);
      
      // Load ghế từ suất chiếu đầu tiên của phòng
      fetchSeatsForRoom(selectedRoomId, selectedDate);
      
      // Load suất chiếu theo ngày được chọn
      fetchShowtimesByDate(selectedRoomId, selectedDate);
      
      // Load thống kê loại ghế
      loadSeatTypeCount(selectedRoomId);
    }
  }, [selectedRoomId]);

  // Xử lý thay đổi ngày từ calendar
  const handleDateChangeLocal = async (date) => {
    console.log('Date changed to:', date, 'for room:', selectedRoomId);
    
    setActiveShowtimeId(null); // Reset suất chiếu đang chọn

    if (selectedRoomId) {
      try {
        // Sử dụng hàm handleDateChange từ hook
        await handleDateChange(date, selectedRoomId);
        
        console.log('Data loaded successfully for date:', date);
      } catch (error) {
        console.error('Error loading data for new date:', error);
      }
    } else {
      // Nếu chưa chọn phòng, chỉ cập nhật ngày
      setSelectedDate(date);
    }
  };

  const handleEditClick = (seat) => {
    if (!seat || !seat.id) return;
    setEditingSeat(seat.id);
    setEditForm({
      seat_type: seat.type || 'standard',
      price: seat.price || '',
      status: seat.status || 'available',
    });
  };

  const handleSave = async () => {
    await handleUpdateSeat(editingSeat, editForm);
    if (selectedRoomId) {
      await loadSeatTypeCount(selectedRoomId);
    }
  };

  const handleRoomSelect = async (roomId) => {
    const room = rooms.find((r) => r.id === parseInt(roomId));
    setSelectedRoomId(roomId);
    setSelectedRoomName(room ? room.name : '');
    setActiveShowtimeId(null);

    if (roomId) {
      // Load dữ liệu ghế
      await fetchSeatsForRoom(roomId, selectedDate);
      
      // Load suất chiếu theo ngày hiện tại
      await fetchShowtimesByDate(roomId, selectedDate);
      
      // Load thống kê
      await loadSeatTypeCount(roomId);
    }
  };

  const handleShowtimeClick = async (showtimeId) => {
    setActiveShowtimeId(showtimeId); // Đổi màu tab khi click
    try {
      await fetchSeatsFromShowtime(selectedRoomId, showtimeId);
      console.log(`Loaded seats for showtime ${showtimeId}`);
    } catch (err) {
      console.error('Error loading seats for showtime:', err);
    }
  };

  // Sắp xếp ghế theo hàng và số ghế
  const organizeSeats = () => {
    if (!seats || !Array.isArray(seats)) return [];
    const seatsByRow = {};
    seats.forEach((seat) => {
      if (seat && seat.row && seat.number) {
        if (!seatsByRow[seat.row]) {
          seatsByRow[seat.row] = [];
        }
        seatsByRow[seat.row].push(seat);
      } else {
        console.warn('Invalid seat data:', seat);
      }
    });

    Object.keys(seatsByRow).forEach((row) => {
      seatsByRow[row].sort((a, b) => a.seat_number - b.seat_number);
    });

    return Object.keys(seatsByRow)
      .sort()
      .map((row) => ({
        row,
        seats: seatsByRow[row],
      }));
  };

  // Lấy class CSS cho ghế dựa trên loại và trạng thái
  const getSeatClass = (seat) => {
    if (!seat || !seat.type || !seat.status) {
      return 'w-10 h-10 m-1 rounded-lg border-2 bg-gray-200 border-gray-400 text-gray-600 opacity-50';
    }
    const baseClass = `${seat.type === 'couple' ? 'w-20' : 'w-10'} h-10 m-1 rounded-lg border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-200 hover:scale-105`;

    if (seat.status === 'reversed') {
      return `${baseClass} bg-red-200 border-red-400 text-red-800 opacity-75`;
    }
    if (seat.status === 'broken') {
      return `${baseClass} bg-gray-300 border-gray-500 text-gray-600 opacity-50 cursor-not-allowed`;
    }

    switch (seat.type) {
      case 'couple':
        return `${baseClass} bg-pink-100 border-pink-400 text-pink-800 hover:bg-pink-200`;
      case 'vip':
        return `${baseClass} bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200`;
      default:
        return `${baseClass} bg-blue-100 border-blue-400 text-blue-800 hover:bg-blue-200`;
    }
  };

  // Lấy class CSS cho trạng thái suất chiếu
  const getShowtimeStatusClass = (status, showtimeId) => {
    const isActive = showtimeId === activeShowtimeId;
    const baseClass =
      'border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md';

    if (isActive) {
      return `${baseClass} bg-blue-200 text-blue-800 border-blue-300 ring-2 ring-blue-400`;
    }

    switch (status) {
      case 'upcoming':
        return `${baseClass} bg-blue-100 text-blue-800 border-blue-200`;
      case 'ongoing':
        return `${baseClass} bg-green-100 text-green-800 border-green-200`;
      case 'finished':
        return `${baseClass} bg-gray-100 text-gray-800 border-gray-200`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800 border-gray-200`;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming':
        return 'Sắp chiếu';
      case 'ongoing':
        return 'Đang chiếu';
      case 'finished':
        return 'Đã kết thúc';
      default:
        return 'Không xác định';
    }
  };

  const organizedSeats = organizeSeats();

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedRoomId ? `Quản lý ghế ${selectedRoomName}` : 'Chọn phòng để xem ghế'}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedRoomId || ''}
              onChange={(e) => handleRoomSelect(e.target.value)}
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
              <div className="flex items-center gap-3">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChangeLocal} // Sử dụng hàm local
                  dateFormat="dd/MM/yyyy"
                  className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholderText="Chọn ngày"
                  minDate={new Date()} // Chỉ cho phép chọn từ hôm nay trở đi
                  maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // Chỉ cho phép chọn trong vòng 30 ngày
                />
                <button
                  onClick={() => handleAutoSetType(selectedRoomId)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Tự động gán loại ghế
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Thống kê loại ghế */}
        {selectedRoomId && seatTypeCount.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-6">
            {seatTypeCount.map((type) => (
              <div
                key={type.seat_type}
                className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 rounded-lg shadow-sm border"
              >
                <div className="text-sm font-medium text-gray-600">
                  {type.seat_type.toUpperCase()}
                </div>
                <div className="text-xl font-bold text-gray-800">{type.total} ghế</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suất chiếu */}
      {selectedRoomId && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Suất chiếu - {selectedRoomName} (
            {selectedDate.toLocaleDateString('vi-VN')})
            {activeShowtimeId && (
              <span className="text-sm font-normal text-blue-600 ml-2">
                (Đang xem ghế của suất chiếu đã chọn)
              </span>
            )}
          </h3>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg text-gray-600">Đang tải suất chiếu...</div>
            </div>
          )}

          {!loading && selectedDateShowtimes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDateShowtimes.map((showtime) => {
                const status = getShowtimeStatus(showtime);
                return (
                  <div
                    key={showtime.id}
                    className={getShowtimeStatusClass(status, showtime.id)}
                    onClick={() => handleShowtimeClick(showtime.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm">
                        {showtime.movie && showtime.movie.title
                          ? showtime.movie.title
                          : 'Phim không xác định'}
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-white bg-opacity-60">
                        {getStatusText(status)}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Bắt đầu:</span>
                        <span className="font-medium">{formatTime(showtime.start_time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kết thúc:</span>
                        <span className="font-medium">{formatTime(showtime.end_time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Giá vé:</span>
                        <span className="font-medium">
                          {showtime.price?.toLocaleString() || 0} VND
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !loading &&
            selectedDateShowtimes.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-yellow-600">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-yellow-800">
                      Không có suất chiếu nào cho phòng {selectedRoomName} vào ngày{' '}
                      {selectedDate.toLocaleDateString('vi-VN')}.
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Vui lòng chọn ngày hoặc phòng khác.
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Loading state cho ghế */}
      {selectedRoomId && loading && (
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
      {selectedRoomId && seats && seats.length > 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-8 rounded-lg inline-block shadow-lg">
              <div className="text-lg font-bold">MÀN HÌNH</div>
            </div>
          </div>

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
              <div className="w-8 h-4 bg-pink-100 border-2 border-pink-400 rounded flex items-center justify-center text-xs">
                💕
              </div>
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

          <div className="space-y-2 max-w-4xl mx-auto">
            {organizedSeats.length > 0 ? (
              organizedSeats.map(({ row, seats: rowSeats }) => (
                <div key={row} className="flex items-center justify-center">
                  <div className="w-8 h-10 flex items-center justify-center font-bold text-gray-600 mr-4">
                    {row}
                  </div>
                  <div className="flex">
                    {rowSeats.map((seat) => (
                      <div
                        key={seat.id}
                        className={getSeatClass(seat)}
                        onClick={() => handleEditClick(seat)}
                        title={`Ghế ${seat.row}${seat.number} - ${seat.type} - ${
                          seat.price?.toLocaleString() || 0
                        } VND`}
                      >
                        {seat.type === 'couple' ? (
                          <span className="text-xs">
                            {seat.number}
                            <br />
                            COUPLE
                          </span>
                        ) : (
                          seat.number
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="w-8 h-10 flex items-center justify-center font-bold text-gray-600 ml-4">
                    {row}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Không có dữ liệu ghế để hiển thị. Vui lòng kiểm tra dữ liệu API.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message khi không có ghế */}
      {selectedRoomId && seats && seats.length === 0 && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-600">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-yellow-800">
                Không tìm thấy ghế cho phòng này.
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Vui lòng kiểm tra dữ liệu API hoặc chọn phòng khác.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form chỉnh sửa ghế */}
      {editingSeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              Chỉnh sửa ghế{' '}
              {seats.find((s) => s.id === editingSeat)?.row || ''}
              {seats.find((s) => s.id === editingSeat)?.number || ''}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại ghế
                </label>
                <select
                  value={editForm.seat_type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, seat_type: e.target.value })
                  }
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
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      price: parseInt(e.target.value) || '',
                    })
                  }
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
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
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