// hooks/useBooking.js - Fixed version with proper date/time params
import { useState, useEffect} from "react";
import { useParams, useSearchParams, useNavigate , useLocation } from "react-router-dom";
import useSeats from "./useSeats";
import useShowtimes from "./useShowtimes";
import useMoviesUser from "./useMovieUser";

const useBooking1 = () => {
  const { movieId } = useParams();
  const location = useLocation();

  // 🆕 Lấy data từ state
  const selectedDate = location.state?.date || null;
  const selectedTime = location.state?.time || null;
  const passedShowtime = location.state?.showtime || null;
  const navigate = useNavigate();
  
  // const selectedDate = searchParams.get("date");
  // const selectedTime = searchParams.get("time");
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [currentShowtime, setCurrentShowtime] = useState(null);
  
  // Hooks
  const { 
    currentMovie, 
    movieLoading, 
    movieError, 
    loadMovieById,
    findMovieInLists,
    clearCurrentMovie
  } = useMoviesUser();
  
  const { 
    seats, 
    loading: seatsLoading, 
    error: seatsError, 
    heldSeats,
    loadSeatsByRoom, 
    loadSeatsByShowtime,
    getUnavailableSeats, 
    getSeatPrice,
    formatSeatsToMap,
    checkAvailability,
    holdSelectedSeats,
    releaseSelectedSeats
  } = useSeats();
  
  const { 
    showtimes, 
    loading: showtimesLoading, 
    error: showtimesError,
    loadShowtimesByMovie,
    getShowtimeById
  } = useShowtimes();

  // Helper function to ensure numbers
  const toNumber = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Load movie info
  useEffect(() => {
    if (movieId) {
      const existingMovie = findMovieInLists(movieId);
      if (existingMovie) {
        console.log('Found movie in existing lists:', existingMovie);
      } else {
        loadMovieById(movieId);
      }
    }
  }, [movieId, loadMovieById, findMovieInLists]);
  
  // Load showtimes
  useEffect(() => {
    if (movieId) {
      loadShowtimesByMovie(movieId);
    }
  }, [movieId]);
  
  // Find and set current showtime
  useEffect(() => {
    if (showtimes.length > 0 && selectedDate && selectedTime) {
      const foundShowtime = showtimes.find(st => {
        const showtimeDate = new Date(st.start_time || st.show_time);
        const formattedDate = showtimeDate.getFullYear() + '-' + 
          String(showtimeDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(showtimeDate.getDate()).padStart(2, '0');
        
        const showtimeTimeStr = st.start_time || st.show_time;
        
        return formattedDate === selectedDate && showtimeTimeStr === selectedTime;
      });
      
      if (foundShowtime) {
        console.log('Found showtime:', foundShowtime);
        
        // FIXED: Clear selected seats when showtime changes
        const isShowtimeChanged = currentShowtime && currentShowtime.id !== foundShowtime.id;
        if (isShowtimeChanged) {
          console.log('Showtime changed, clearing selected seats');
          setSelectedSeats([]);
        }
        
        setCurrentShowtime(foundShowtime);
      }
    }
  }, [showtimes, selectedDate, selectedTime, currentShowtime]);

  // FIXED: Reset selectedSeats when selectedTime changes (URL param change)
  useEffect(() => {
    console.log('Selected time changed, clearing seats');
    setSelectedSeats([]);
  }, [selectedTime]);

  // Load seats when showtime is found
  useEffect(() => {
    if (currentShowtime) {
      console.log('Loading seats for showtime:', currentShowtime);
      if (currentShowtime.room_id) {
        loadSeatsByRoom(currentShowtime.room_id);
      } else if (currentShowtime.id && currentShowtime.room_id) {
        loadSeatsByShowtime(currentShowtime.id, currentShowtime.room_id);
      } else {
        console.error('No showtime ID or room ID found:', currentShowtime);
      }
    }
  }, [currentShowtime]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (heldSeats.length > 0 && currentShowtime?.id) {
        releaseSelectedSeats(currentShowtime.id, heldSeats);
      }
      clearCurrentMovie();
    };
  }, [heldSeats, currentShowtime?.id, clearCurrentMovie]);

  // Debug logs
  useEffect(() => {
    console.log('Current seats data:', seats);
    console.log('Seats loading:', seatsLoading);
    console.log('Seats error:', seatsError);
  }, [seats, seatsLoading, seatsError]);

  // Computed values
  const movieInfo = currentMovie || findMovieInLists(movieId) || {
    title: "Đang tải...",
    poster: null,
    subtitle: "2D Phụ Đề",
    rating: "T16"
  };

  const seatMap = formatSeatsToMap(seats);
  const unavailableSeats = getUnavailableSeats();
  const seatRows = [...new Set(seats.map(seat => seat.seat_row))].sort();
  const seatCols = [...new Set(seats.map(seat => seat.seat_number))].sort((a, b) => a - b);

  const otherShowtimes = showtimes.filter(st => {
    const showtimeDate = new Date(st.start_time || st.show_time);
    const formattedDate = showtimeDate.getFullYear() + '-' + 
      String(showtimeDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(showtimeDate.getDate()).padStart(2, '0');
    
    return formattedDate === selectedDate && (st.start_time || st.show_time) !== selectedTime;
  });

  // Calculate total price with proper number conversion
  const showtimePrice = toNumber(currentShowtime?.price || 0);
  const totalPrice = selectedSeats.reduce((total, seatId) => {
    const seatPrice = toNumber(getSeatPrice(seatId));
    return total + seatPrice + showtimePrice;
  }, 0);

  const isLoading = seatsLoading || showtimesLoading || movieLoading;
  const hasError = seatsError || showtimesError || movieError;

  // Utility functions
  const formatTime = (timeStr) => {
    if (!timeStr) return "00:00";
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "00:00";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      
      if (isToday) {
        return "Hôm nay";
      }
      
      return date.toLocaleDateString("vi-VN", { 
        weekday: "long",
        day: "2-digit", 
        month: "2-digit",
        year: "numeric"
      });
    } catch (error) {
      return dateStr;
    }
  };

  // Get total seat price with proper number conversion
  const getTotalSeatPrice = (seatId) => {
    const seatPrice = toNumber(getSeatPrice(seatId));
    const showtimePrice = toNumber(currentShowtime?.price || 0);
    return seatPrice + showtimePrice;
  };

  // Wrapper for getSeatPrice to ensure it returns a number
  const getSeatPriceAsNumber = (seatId) => {
    return toNumber(getSeatPrice(seatId));
  };

  // Event handlers
  const toggleSeat = async (seatId) => {
    if (unavailableSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
      return;
    }

    if (currentShowtime?.id) {
      try {
        const availability = await checkAvailability(currentShowtime.id, [seatId]);
        if (availability.available) {
          setSelectedSeats((prev) => [...prev, seatId]);
        } else {
          alert('Ghế này đã được đặt bởi người khác!');
          if (currentShowtime.room_id) {
            loadSeatsByShowtime(currentShowtime.id, currentShowtime.room_id);
          }
        }
      } catch (error) {
        console.error('Error checking seat availability:', error);
        alert('Lỗi kiểm tra ghế, vui lòng thử lại!');
      }
    } else {
      setSelectedSeats((prev) => [...prev, seatId]);
    }
  };

  const clearSelectedSeats = () => {
    setSelectedSeats([]);
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;
    
    const params = new URLSearchParams({
      showtime_id: currentShowtime?.id || '',
      seats: selectedSeats.join(','),
      booking_total: totalPrice.toString(),
      // FIXED: Truyền raw values thay vì formatted values
      raw_date: selectedDate || '', // Raw date format: YYYY-MM-DD
      raw_time: selectedTime || '', // Raw time format: YYYY-MM-DD HH:MM:SS
      formatted_date: formatDate(selectedDate) || '', // Formatted for display
      formatted_time: formatTime(selectedTime) || '', // Formatted for display
      movie_id: movieId || '',
      movie_title: movieInfo.title || 'Đang tải...',
      room_name: currentShowtime.room?.name || `Phòng ${currentShowtime.room_id || 'N/A'}`,
      room_type: currentShowtime.room?.type || '2D',
      rating: movieInfo.age || 'T16'
    });
    
    navigate(`/food?${params.toString()}`);
  };

  const handleGoBack = () => {
    navigate(`/movies/${movieId}`);
  };

  // FIXED: Enhanced handleChangeShowtime to ensure seats are cleared
  const handleChangeShowtime = (timeParam) => {
    console.log('Changing showtime, clearing selected seats');
    setSelectedSeats([]); // Explicitly clear seats before navigation
    navigate(`/booking/${movieId}?date=${selectedDate}&time=${timeParam}`);
  };
  
  return {
    movieId,
    // State
    selectedSeats,
    currentShowtime,
    movieInfo,
    
    // Computed values
    seatMap,
    unavailableSeats,
    seatRows,
    seatCols,
    otherShowtimes,
    totalPrice,
    
    // Loading and error states
    isLoading,
    hasError,
    seatsError,
    showtimesError,
    movieError,
    
    // Data
    seats,
    selectedDate,
    selectedTime,
    movieId,
    
    // Utility functions
    formatTime,
    formatDate,
    getSeatPrice: getSeatPriceAsNumber,
    getTotalSeatPrice,
    
    // Event handlers
    toggleSeat,
    clearSelectedSeats,
    handleContinue,
    handleGoBack,
    handleChangeShowtime
  };
};

export default useBooking1;