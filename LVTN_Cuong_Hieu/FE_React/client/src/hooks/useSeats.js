// hooks/useSeats.js - Updated with better fallback logic
import { useState, useEffect } from 'react';
import { 
  fetchSeatsByRoom, 
  fetchSeatsByShowtime, 
  checkSeatAvailability,
  holdSeats,
  releaseHeldSeats 
} from '../services/apiSeat';

const useSeats = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [heldSeats, setHeldSeats] = useState([]);

  // Hàm load ghế theo room_id
  const loadSeatsByRoom = async (roomId) => {
    if (!roomId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchSeatsByRoom(roomId);
      setSeats(data);
      console.log('Loaded seats by room:', data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading seats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm load ghế theo showtime (với fallback về room)
  const loadSeatsByShowtime = async (showtimeId, roomId = null) => {
    if (!showtimeId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchSeatsByShowtime(showtimeId, roomId);
      setSeats(data);
      console.log('Loaded seats by showtime/room:', data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading seats by showtime:', err);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra ghế có sẵn
  const checkAvailability = async (showtimeId, seatIds) => {
    try {
      const result = await checkSeatAvailability(showtimeId, seatIds);
      return result;
    } catch (err) {
      console.error('Error checking availability:', err);
      throw err;
    }
  };

  // Giữ ghế tạm thời
  const holdSelectedSeats = async (showtimeId, seatIds) => {
    try {
      const result = await holdSeats(showtimeId, seatIds);
      setHeldSeats(seatIds);
      return result;
    } catch (err) {
      console.error('Error holding seats:', err);
      throw err;
    }
  };

  // Hủy giữ ghế
  const releaseSelectedSeats = async (showtimeId, seatIds) => {
    try {
      const result = await releaseHeldSeats(showtimeId, seatIds);
      setHeldSeats([]);
      return result;
    } catch (err) {
      console.error('Error releasing seats:', err);
      throw err;
    }
  };

  // Hàm format ghế thành dạng map theo hàng và số
  const formatSeatsToMap = (seatsData) => {
    const seatMap = {};
    seatsData.forEach(seat => {
      const seatId = `${seat.seat_row}${seat.seat_number}`;
      seatMap[seatId] = {
        id: seat.id,
        status: seat.status, // available, reserved, broken
        price: seat.price,
        row: seat.seat_row,
        number: seat.seat_number,
        type: seat.seat_type || 'standard'
      };
    });
    return seatMap;
  };

  // Lấy danh sách ghế đã bán (reserved hoặc broken)
  const getUnavailableSeats = () => {
    return seats
      .filter(seat => seat.status !== 'available')
      .map(seat => `${seat.seat_row}${seat.seat_number}`);
  };

  // Lấy giá ghế theo loại
  const getSeatPrice = (seatId) => {
    const seat = seats.find(s => `${s.seat_row}${s.seat_number}` === seatId);
    return seat ? seat.price : 75000;
  };

  return {
    seats,
    loading,
    error,
    heldSeats,
    loadSeatsByRoom,
    loadSeatsByShowtime,
    formatSeatsToMap,
    getUnavailableSeats,
    getSeatPrice,
    checkAvailability,
    holdSelectedSeats,
    releaseSelectedSeats
  };
};

export default useSeats;