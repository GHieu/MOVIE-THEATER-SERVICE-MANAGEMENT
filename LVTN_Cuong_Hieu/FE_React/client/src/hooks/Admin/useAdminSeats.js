// hooks/useAdminSeats.js
import { useState } from 'react';
import {
  getSeatsByRoom,
  updateSeat,
  autoSetSeatType,
  fetchSeatTypeCount,
} from '../../services/ADMINS/apiAdminSeats';

const useAdminSeats = () => {
  const [seats, setSeats] = useState([]);
  const [seatTypeCount, setSeatTypeCount] = useState([]);
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
      countMap[seat.seat_type] = (countMap[seat.seat_type] || 0) + 1;
    });
    const counts = Object.entries(countMap).map(([seat_type, total]) => ({
      seat_type,
      total,
    }));
    setSeatTypeCount(counts);
  };

  const fetchSeatsForRoom = async (roomId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSeatsByRoom(roomId);
      setSeats(data);
      // Sử dụng API để lấy thống kê
      await loadSeatTypeCount(roomId);
    } catch (err) {
      setError('Lỗi khi tải ghế');
      console.error('Error fetching seats:', err);
    }
    setLoading(false);
  };

  const handleUpdateSeat = async (seatId, updatedData) => {
    try {
      setError(null);
      await updateSeat(seatId, updatedData);
      
      // Cập nhật state ghế
      const updatedSeats = seats.map((seat) => 
        seat.id === seatId ? { ...seat, ...updatedData } : seat
      );
      setSeats(updatedSeats);
      
      // Lấy lại thống kê từ API sau khi cập nhật
      const currentRoomId = updatedSeats[0]?.room_id; // Giả sử có room_id trong seat data
      if (currentRoomId) {
        await loadSeatTypeCount(currentRoomId);
      } else {
        // Fallback: tính từ dữ liệu hiện tại
        calculateSeatTypeCountFromSeats();
      }
      
      setEditingSeat(null);
    } catch (err) {
      setError('Lỗi khi cập nhật ghế');
      console.error('Error updating seat:', err);
    }
  };

  const handleAutoSetType = async (roomId) => {
    setLoading(true);
    try {
      setError(null);
      await autoSetSeatType(roomId);
      // Tải lại danh sách ghế và thống kê
      await fetchSeatsForRoom(roomId);
    } catch (err) {
      setError('Lỗi khi tự động gán loại ghế');
      console.error('Error auto setting seat types:', err);
    }
    setLoading(false);
  };

  return {
    seats,
    seatTypeCount,
    loading,
    error,
    editingSeat,
    setEditingSeat,
    setSeatTypeCount,
    fetchSeatsForRoom,
    handleUpdateSeat,
    handleAutoSetType,
    loadSeatTypeCount, // Export API function
    calculateSeatTypeCountFromSeats, // Export backup function
  };
};

export default useAdminSeats;