// hooks/useAdminSeats.js
import { useState } from 'react';
import {
  updateSeat,
  autoSetSeatType,
  fetchSeatTypeCount,
  getShowtimesByRoom,
  getSeatsByShowtime,
} from '../../services/ADMINS/apiAdminSeats';

const useAdminSeats = () => {
  const [seats, setSeats] = useState([]);
  const [seatTypeCount, setSeatTypeCount] = useState([]);
  const [selectedDateShowtimes, setSelectedDateShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Thêm state cho ngày được chọn
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingSeat, setEditingSeat] = useState(null);

  // Hàm lấy thống kê số lượng ghế từ API
  const loadSeatTypeCount = async (roomId) => {
    try {
      const countData = await fetchSeatTypeCount(roomId);
      setSeatTypeCount(countData);
    } catch (err) {
      console.error('Error fetching seat type count:', err);
      // Fallback: tính toán từ dữ liệu ghế hiện tại
      calculateSeatTypeCountFromSeats();
    }
  };

  // Hàm tính toán số lượng loại ghế từ dữ liệu ghế (backup)
  const calculateSeatTypeCountFromSeats = () => {
    const countMap = {};
    seats.forEach((seat) => {
      countMap[seat.type] = (countMap[seat.type] || 0) + 1;
    });
    const counts = Object.entries(countMap).map(([seat_type, total]) => ({
      seat_type,
      total,
    }));
    setSeatTypeCount(counts);
  };

  // Hàm helper để so sánh ngày (chỉ so sánh ngày, không so sánh giờ)
  const isSameDate = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Hàm format ngày thành YYYY-MM-DD
  const formatDateToYMD = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Hàm lấy suất chiếu theo ngày được chọn từ calendar
  const fetchShowtimesByDate = async (roomId, date) => {
    try {
      setLoading(true);
      setError(null);
      
      // QUAN TRỌNG: Reset state trước khi fetch dữ liệu mới
      setSelectedDateShowtimes([]);
      
      // Đảm bảo date là Date object
      const targetDate = new Date(date);
      const formattedDate = formatDateToYMD(targetDate);
      
      console.log('=== FETCHING SHOWTIMES BY DATE ===');
      console.log('Room ID:', roomId);
      console.log('Selected Date:', targetDate);
      console.log('Formatted Date:', formattedDate);
      
      // Gọi API để lấy suất chiếu theo phòng và ngày
      const response = await getShowtimesByRoom(roomId, { date: formattedDate });
      console.log('API Response:', response);
      
      let allShowtimes = [];

      // Xử lý response data
      if (response && response.data) {
        allShowtimes = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        allShowtimes = response;
      } else if (response) {
        allShowtimes = [response];
      }

      console.log('All showtimes from API:', allShowtimes);

      // Lọc suất chiếu theo ngày được chọn
      const filteredShowtimes = allShowtimes.filter(showtime => {
        if (!showtime || !showtime.start_time) {
          console.log('Invalid showtime:', showtime);
          return false;
        }
        
        const showtimeDate = new Date(showtime.start_time);
        const isMatchingDate = isSameDate(showtimeDate, targetDate);
        
        console.log(`Showtime ${showtime.id}:`, {
          start_time: showtime.start_time,
          showtimeDate: showtimeDate.toDateString(),
          targetDate: targetDate.toDateString(),
          isMatchingDate
        });
        
        return isMatchingDate;
      });

      console.log(`=== RESULT: Found ${filteredShowtimes.length} showtimes for ${formattedDate} ===`);
      
      // Cập nhật state
      setSelectedDateShowtimes(filteredShowtimes);
      
      return filteredShowtimes;
    } catch (err) {
      console.error('Error fetching showtimes by date:', err);
      setError(`Không thể tải suất chiếu: ${err.message}`);
      setSelectedDateShowtimes([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi người dùng chọn ngày từ calendar
  const handleDateChange = async (date, roomId) => {
    setSelectedDate(date);
    if (roomId) {
      await fetchShowtimesByDate(roomId, date);
    }
  };

  // Hàm lấy ghế của phòng từ suất chiếu đầu tiên trong ngày được chọn
  const fetchSeatsFromShowtime = async (roomId, specificShowtimeId = null) => {
    try {
      let showtimeId = specificShowtimeId;
      
      if (!showtimeId) {
        // Nếu không có showtimeId cụ thể, lấy từ suất chiếu đầu tiên của ngày được chọn
        if (selectedDateShowtimes.length > 0) {
          showtimeId = selectedDateShowtimes[0].id;
        } else {
          // Nếu chưa có dữ liệu suất chiếu, fetch lại
          const showtimes = await fetchShowtimesByDate(roomId, selectedDate);
          if (showtimes.length > 0) {
            showtimeId = showtimes[0].id;
          } else {
            console.log('No showtimes found for room:', roomId, 'on date:', selectedDate);
            setSeats([]);
            return [];
          }
        }
      }
      
      const seatsData = await getSeatsByShowtime(showtimeId);
      
      let seats = [];
      if (seatsData && seatsData.data) {
        seats = Array.isArray(seatsData.data) ? seatsData.data : seatsData;
      } else if (Array.isArray(seatsData)) {
        seats = seatsData;
      }
      
      // Map field names từ backend sang frontend
      const normalizedSeats = seats.map(seat => ({
        id: seat.id,
        row: seat.seat_row || seat.row || 'Unknown',
        number: seat.seat_number || seat.number || 0,
        type: seat.seat_type || seat.type || 'standard',
        price: seat.price || 0,
        status: seat.status || 'available',
        room_id: seat.room_id || roomId,
        showtime_id: showtimeId
      })).filter(seat => seat.row !== 'Unknown' && seat.number !== 0);
      
      console.log(`Seats fetched from showtime ${showtimeId}:`, normalizedSeats);
      setSeats(normalizedSeats);
      return normalizedSeats;
      
    } catch (err) {
      console.error('Error fetching seats from showtime:', err);
      setSeats([]);
      return [];
    }
  };

  // Hàm chính để lấy dữ liệu cho phòng theo ngày được chọn
  const fetchSeatsForRoom = async (roomId, date = null) => {
    setLoading(true);
    setError(null);
    
    // Reset tất cả state khi chuyển phòng
    setSeats([]);
    setSeatTypeCount([]);
    setSelectedDateShowtimes([]);
    
    try {
      const targetDate = date || selectedDate;
      
      // Lấy suất chiếu theo ngày được chọn
      await fetchShowtimesByDate(roomId, targetDate);
      
      // Lấy ghế từ suất chiếu đầu tiên
      await fetchSeatsFromShowtime(roomId);
      
      // Lấy thống kê loại ghế
      await loadSeatTypeCount(roomId);
      
    } catch (err) {
      setError('Lỗi khi tải dữ liệu phòng');
      console.error('Error fetching room data:', err);
    }
    setLoading(false);
  };

  const handleUpdateSeat = async (seatId, updatedData) => {
    try {
      setError(null);
      
      // Validation trước khi gửi
      const seatType = updatedData.seat_type || updatedData.type;
      const price = Number(updatedData.price);
      const status = updatedData.status;
      
      // Kiểm tra validation
      if (!['standard', 'vip', 'couple'].includes(seatType)) {
        setError('Loại ghế không hợp lệ');
        return;
      }
      
      if (!['available', 'reserved', 'broken'].includes(status)) {
        setError('Trạng thái ghế không hợp lệ');
        return;
      }
      
      if (price < 0) {
        setError('Giá ghế phải lớn hơn hoặc bằng 0');
        return;
      }
      
      const currentSeat = seats.find(seat => seat.id === seatId);
      
      const seatData = {
        seat_type: seatType,
        price: price,
        status: status,
        seat_row: currentSeat.row,
        seat_number: currentSeat.number
      };
      
      console.log('Sending validated seat data:', seatData);
      
      await updateSeat(seatId, seatData);
      
      // Cập nhật state
      const updatedSeats = seats.map((seat) => 
        seat.id === seatId ? { 
          ...seat, 
          type: seatType,
          price: price, 
          status: status 
        } : seat
      );
      setSeats(updatedSeats);
      
      const currentRoomId = updatedSeats[0]?.room_id;
      if (currentRoomId) {
        await loadSeatTypeCount(currentRoomId);
      } else {
        calculateSeatTypeCountFromSeats();
      }
      
      setEditingSeat(null);
    } catch (err) {
      setError(`Lỗi khi cập nhật ghế: ${err.response?.data?.message || err.message}`);
      console.error('Error updating seat:', err);
    }
  };

  const handleAutoSetType = async (roomId) => {
    setLoading(true);
    try {
      setError(null);
      await autoSetSeatType(roomId);
      // Tải lại danh sách ghế và thống kê
      await fetchSeatsForRoom(roomId, selectedDate);
    } catch (err) {
      setError('Lỗi khi tự động gán loại ghế');
      console.error('Error auto setting seat types:', err);
    }
    setLoading(false);
  };

  // Hàm format thời gian
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Hàm kiểm tra trạng thái suất chiếu
  const getShowtimeStatus = (showtime) => {
    const now = new Date();
    const startTime = new Date(showtime.start_time);
    const endTime = new Date(showtime.end_time);
    
    if (now < startTime) {
      return 'upcoming';
    } else if (now >= startTime && now <= endTime) {
      return 'ongoing';
    } else {
      return 'finished';
    }
  };

  return {
    seats,
    seatTypeCount,
    selectedDateShowtimes, // Thay đổi từ todayShowtimes
    selectedDate, // Thêm selectedDate
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
    fetchShowtimesByDate, // Thay đổi từ fetchTodayShowtimes
    handleDateChange, // Thêm hàm xử lý thay đổi ngày
    fetchSeatsFromShowtime,
    formatTime,
    getShowtimeStatus,
    setSelectedDate, // Thêm setter cho selectedDate
  };
};

export default useAdminSeats;