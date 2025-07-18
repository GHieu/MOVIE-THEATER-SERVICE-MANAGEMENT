import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Film, MapPin, DollarSign, Plus, X, Check, Edit, Trash2, AlertCircle } from 'lucide-react';
import useShowtimes from '../../hooks/Admin/useAdminShowtimes';

const ImprovedAdminShowtimes = () => {
  const {
    movieOptions,
    roomOptions,
    newShowtime,
    editingShowtime,
    loading,
    error,
    setEditingShowtime,
    handleAddShowtime,
    handleUpdateShowtime,
    handleDeleteShowtime,
    handleInputChange,
    searchQuery,
    setSearchQuery,
    showtimes,
    currentPage,
    totalPages,
    goToPage,
    totalShowtimeCount,
    filteredShowtimeCount,
    summary,
    resetForm,
    formatDateTimeForInput,
    formatDisplayTime,
    getShowtimeStatus,
    fetchAllShowtimesNoFilter,
  } = useShowtimes();

  const [isAdding, setIsAdding] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [allShowtimes, setAllShowtimes] = useState([]);
  const showtimeData = editingShowtime || newShowtime;
  const canAddShowtime = movieOptions.length > 0 && roomOptions.length > 0;

  // Tạo time slots (từ 8:00 đến 23:00, mỗi 30 phút)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Tính toán thời gian kết thúc dựa trên phim được chọn
  const calculateEndTime = (startTime, movieId) => {
    const movie = movieOptions.find(m => m.id == movieId);
    if (!movie || !startTime || !movie.duration) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + movie.duration * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  // Kiểm tra xung đột lịch chiếu
  const checkConflict = (date, roomId, startTime, endTime) => {
    if (!date || !roomId || !startTime || !endTime) return false;
    
    return allShowtimes.some(showtime => {
      // Bỏ qua showtime đang edit
      if (editingShowtime && showtime.id === editingShowtime.id) return false;
      
      const showtimeDate = new Date(showtime.start_time).toISOString().split('T')[0];
      const showtimeStartTime = new Date(showtime.start_time).toTimeString().substring(0, 5);
      const showtimeEndTime = new Date(showtime.end_time).toTimeString().substring(0, 5);
      
      return showtimeDate === date && 
             showtime.room_id == roomId &&
             ((startTime >= showtimeStartTime && startTime < showtimeEndTime) ||
              (endTime > showtimeStartTime && endTime <= showtimeEndTime) ||
              (startTime <= showtimeStartTime && endTime >= showtimeEndTime));
    });
  };

  // Lấy các time slot bị xung đột
  const getConflictingSlots = (roomId, date) => {
    const conflictingSlots = new Set();
    
    allShowtimes.forEach(showtime => {
      // Bỏ qua showtime đang edit
      if (editingShowtime && showtime.id === editingShowtime.id) return;
      
      const showtimeDate = new Date(showtime.start_time).toISOString().split('T')[0];
      if (showtimeDate === date && showtime.room_id == roomId) {
        const startTime = new Date(showtime.start_time);
        const endTime = new Date(showtime.end_time);
        
        const startHour = startTime.getHours();
        const startMinute = startTime.getMinutes();
        const endHour = endTime.getHours();
        const endMinute = endTime.getMinutes();
        
        // Đánh dấu tất cả time slots trong khoảng thời gian này
        for (let hour = startHour; hour <= endHour; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const currentTime = hour * 60 + minute;
            const startTimeMinutes = startHour * 60 + startMinute;
            const endTimeMinutes = endHour * 60 + endMinute;
            
            if (currentTime >= startTimeMinutes && currentTime < endTimeMinutes) {
              conflictingSlots.add(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
            }
          }
        }
      }
    });
    
    return conflictingSlots;
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    const dateTime = `${selectedDate}T${time}`;
    handleInputChange({
      target: { name: 'start_time', value: dateTime }
    });
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (selectedTime) {
      const dateTime = `${date}T${selectedTime}`;
      handleInputChange({
        target: { name: 'start_time', value: dateTime }
      });
    }
  };

  // Auto calculate end time when start_time or movie changes
  useEffect(() => {
    if (showtimeData.start_time && showtimeData.movie_id) {
      const movie = movieOptions.find(m => m.id == showtimeData.movie_id);
      if (movie && movie.duration) {
        const startTime = new Date(showtimeData.start_time);
        const endTime = new Date(startTime.getTime() + movie.duration * 60 * 1000);
        
        const year = endTime.getFullYear();
        const month = String(endTime.getMonth() + 1).padStart(2, '0');
        const day = String(endTime.getDate()).padStart(2, '0');
        const hours = String(endTime.getHours()).padStart(2, '0');
        const minutes = String(endTime.getMinutes()).padStart(2, '0');
        
        const endTimeFormatted = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        handleInputChange({
          target: { name: 'end_time', value: endTimeFormatted }
        });
      }
    }
  }, [showtimeData.start_time, showtimeData.movie_id, movieOptions]);

  // Sync selected values with form data
  useEffect(() => {
    if (showtimeData.start_time) {
      const date = new Date(showtimeData.start_time);
      setSelectedDate(date.toISOString().split('T')[0]);
      setSelectedTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`);
    }
  }, [showtimeData.start_time]);

  const handleSubmit = async () => {
    if (!showtimeData.movie_id || !showtimeData.room_id || !showtimeData.start_time || !showtimeData.end_time || !showtimeData.price) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }

    // Check conflict
    const startTime = new Date(showtimeData.start_time).toTimeString().substring(0, 5);
    const endTime = new Date(showtimeData.end_time).toTimeString().substring(0, 5);
    const date = new Date(showtimeData.start_time).toISOString().split('T')[0];
    
    if (checkConflict(date, showtimeData.room_id, startTime, endTime)) {
      alert('Lịch chiếu bị xung đột với suất chiếu khác!');
      return;
    }

    try {
      if (editingShowtime) {
        await handleUpdateShowtime();
        setEditingShowtime(null);
      } else {
        await handleAddShowtime();
        setIsAdding(false);
      }
      setSelectedTime('');
    } catch (err) {
      console.error('Form submit error:', err);
      alert(err.message || 'Lỗi khi xử lý suất chiếu');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingShowtime(null);
    setSelectedTime('');
    resetForm();
  };

  const handleEdit = (showtime) => {
    setEditingShowtime({
      ...showtime,
      start_time: formatDateTimeForInput(showtime.start_time),
      end_time: formatDateTimeForInput(showtime.end_time),
    });
    setIsAdding(false);
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setEditingShowtime(null);
    resetForm();
    setSelectedTime('');
  };

  const conflictingSlots = showtimeData.room_id ? getConflictingSlots(showtimeData.room_id, selectedDate) : new Set();
  const selectedMovie = movieOptions.find(m => m.id == showtimeData.movie_id);
  const endTimeCalculated = selectedTime && selectedMovie ? calculateEndTime(selectedTime, showtimeData.movie_id) : '';
  const hasConflict = selectedTime && endTimeCalculated && showtimeData.room_id ? 
    checkConflict(selectedDate, showtimeData.room_id, selectedTime, endTimeCalculated) : false;

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center mt-4 space-x-2">
        <button
          className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          « Trước
        </button>
        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;
          if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
            return (
              <button
                key={pageNum}
                className={`px-3 py-1 border rounded ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => goToPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
            return <span key={pageNum} className="px-2 text-gray-500">...</span>;
          }
          return null;
        })}
        <button
          className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau »
        </button>
      </div>
    );
  };
  useEffect(() => {
  const fetchAll = async () => {
    const all = await fetchAllShowtimesNoFilter();
    setAllShowtimes(all);
  };
  fetchAll();
}, []);
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý suất chiếu</h1>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-semibold">
              {searchQuery ? `Kết quả: ${filteredShowtimeCount} (Tổng: ${totalShowtimeCount})` : `Tổng: ${totalShowtimeCount}`}
            </p>
            {summary && (
              <div className="text-sm text-gray-600 mt-1">
                <span className="mr-4">Sắp tới: {summary.upcoming}</span>
                <span className="mr-4">Đang chiếu: {summary.ongoing}</span>
                <span>Đã kết thúc: {summary.finished}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-1/2">
            <input
              type="text"
              placeholder="Tìm theo tên phim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Warning */}
      {!canAddShowtime && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <p>Cần có ít nhất một phim và một phòng hoạt động để thêm suất chiếu.</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={handleAddClick}
          disabled={!canAddShowtime}
          className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
            canAddShowtime 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-400 cursor-not-allowed text-white'
          }`}
        >
          <Plus className="w-5 h-5" />
          Thêm suất chiếu
        </button>
      </div>

      {/* Form */}
      {(isAdding || editingShowtime) && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">
            {editingShowtime ? 'Chỉnh sửa suất chiếu' : 'Thêm suất chiếu mới'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Movie Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Film className="inline w-4 h-4 mr-2" />
                Phim *
              </label>
              <select
                name="movie_id"
                value={showtimeData.movie_id || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn phim</option>
                {movieOptions.map(movie => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title} {movie.duration && `(${movie.duration} phút)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-2" />
                Phòng chiếu *
              </label>
              <select
                name="room_id"
                value={showtimeData.room_id || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn phòng</option>
                {roomOptions.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline w-4 h-4 mr-2" />
                Giá vé *
              </label>
              <input
                type="number"
                name="price"
                value={showtimeData.price || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
              />
            </div>

            {/* Promotion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Khuyến mãi
              </label>
              <input
                type="number"
                name="promotion_id"
                value={showtimeData.promotion_id || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-2" />
              Chọn ngày *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Time Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-2" />
              Chọn giờ bắt đầu *
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
              {timeSlots.map(time => {
                const isSelected = selectedTime === time;
                const isConflicted = conflictingSlots.has(time);
                const isDisabled = isConflicted && showtimeData.room_id;
                
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => !isDisabled && handleTimeSelect(time)}
                    disabled={isDisabled}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isSelected 
                        ? 'bg-blue-600 text-white' 
                        : isDisabled 
                          ? 'bg-red-100 text-red-400 cursor-not-allowed' 
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            {showtimeData.room_id && conflictingSlots.size > 0 && (
              <p className="text-sm text-red-600 mt-2">
                Các khung giờ màu đỏ đã có lịch chiếu trong phòng này
              </p>
            )}
          </div>

          {/* End Time Preview */}
          {selectedTime && selectedMovie && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Clock className="inline w-4 h-4 mr-2" />
                Thời gian: {selectedTime} - {endTimeCalculated}
                {hasConflict && (
                  <span className="text-red-600 ml-2">⚠️ Xung đột lịch chiếu!</span>
                )}
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading || !canAddShowtime || hasConflict}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Đang xử lý...' : (editingShowtime ? 'Cập nhật' : 'Thêm')}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Showtime List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Đang tải...</p>
        </div>
      ) : showtimes.length > 0 ? (
        <>
          <div className="space-y-4">
            {showtimes.map(showtime => {
              const movieInactive = showtime.movie?.status === 0;
              const roomInactive = showtime.room?.status === 0;
              const hasInactive = movieInactive || roomInactive;
              const timeStatus = showtime.status 
                ? { 
                    status: showtime.status, 
                    color: showtime.status === 'Sắp tới' ? 'text-blue-600' : 
                          showtime.status === 'Đang chiếu' ? 'text-green-600' : 
                          'text-gray-600' 
                  } 
                : getShowtimeStatus(showtime.start_time, showtime.end_time);

              return (
                <div key={showtime.id} className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${hasInactive ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${timeStatus.color.replace('text-', 'bg-').replace('-600', '-100')} ${timeStatus.color}`}>
                          {formatDisplayTime(showtime.start_time)} - {formatDisplayTime(showtime.end_time)}
                        </div>
                        <h4 className={`font-semibold ${movieInactive ? 'text-red-600' : 'text-gray-800'}`}>
                          {showtime.movie?.title || `Phim #${showtime.movie_id}`}
                          {movieInactive && <AlertCircle className="inline w-4 h-4 ml-1" />}
                        </h4>
                        <span className={`text-sm font-medium ${timeStatus.color}`}>
                          {timeStatus.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <MapPin className="inline w-4 h-4 mr-1" />
                          <span className={roomInactive ? 'text-red-600' : ''}>
                            {showtime.room?.name || `Phòng #${showtime.room_id}`}
                            {roomInactive && <AlertCircle className="inline w-4 h-4 ml-1" />}
                          </span>
                        </p>
                        <p><DollarSign className="inline w-4 h-4 mr-1" />{Number(showtime.price).toLocaleString('vi-VN')}đ</p>
                        <p><Calendar className="inline w-4 h-4 mr-1" />{new Date(showtime.start_time).toLocaleDateString('vi-VN')}</p>
                        {showtime.promotion && (
                          <p>🎟️ {showtime.promotion.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                      <button
                        onClick={() => handleEdit(showtime)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteShowtime(showtime.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {renderPagination()}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            {searchQuery ? 'Không tìm thấy suất chiếu nào.' : 'Chưa có suất chiếu nào.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImprovedAdminShowtimes;