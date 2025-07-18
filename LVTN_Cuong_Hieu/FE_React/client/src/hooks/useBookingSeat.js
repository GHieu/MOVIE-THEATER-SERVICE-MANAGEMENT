import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import useSeats from "./useSeats";
import useShowtimes from "./useShowtimes";
import useMoviesUser from "./useMovieUser";

const useBooking1 = () => {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedDate = searchParams.get("date") || location.state?.date || null;
  const selectedTime = searchParams.get("time") || location.state?.time || null;


  const [selectedSeats, setSelectedSeats] = useState([]);
  const [currentShowtime, setCurrentShowtime] = useState(null);

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
    releaseSelectedSeats
  } = useSeats();

  const {
    showtimes,
    loading: showtimesLoading,
    error: showtimesError,
    loadShowtimesByMovie
  } = useShowtimes();

  const toNumber = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Load movie info
  useEffect(() => {
    if (movieId) {
      const cached = findMovieInLists(movieId);
      if (!cached) loadMovieById(movieId);
    }
  }, [movieId]);

  // Load showtimes
  useEffect(() => {
    if (movieId) {
      loadShowtimesByMovie(movieId);
    }
  }, [movieId]);

  // Tìm và set showtime
  useEffect(() => {
    if (showtimes.length && selectedDate && selectedTime) {
      const found = showtimes.find((st) => {
        const start = new Date(st.start_time || st.show_time);
        const d =
          start.getFullYear() +
          "-" +
          String(start.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(start.getDate()).padStart(2, "0");
        const t = st.start_time || st.show_time;
        return d === selectedDate && t === selectedTime;
      });

      if (found) {
        setCurrentShowtime((prev) => {
          if (!prev || prev.id !== found.id) {
            return found;
          }
          return prev;
        });
      } else {
        setCurrentShowtime(null);
      }
    }
  }, [showtimes, selectedDate, selectedTime]);

  // Load seats khi có showtime
  useEffect(() => {
    if (currentShowtime?.id) {
      loadSeatsByShowtime(currentShowtime.id);
    }
  }, [currentShowtime]);

  // ✅ Restore selectedSeats từ sessionStorage
  useEffect(() => {
  const stored = sessionStorage.getItem("bookingState");
  if (stored && currentShowtime) {
    try {
      const parsed = JSON.parse(stored);

      // ✅ Nếu đã thanh toán (có ticketId), không restore
      if (parsed.ticketId) {
        sessionStorage.removeItem("bookingState");
        return;
      }

      if (
        parsed.movieId === movieId &&
        parsed.selectedDate === selectedDate &&
        parsed.selectedTime === selectedTime &&
        parsed.currentShowtimeId === currentShowtime.id
      ) {
        if (Array.isArray(parsed.selectedSeats)) {
          setSelectedSeats(parsed.selectedSeats);
        }
      }
    } catch (error) {
      console.error("❌ Lỗi khi parse sessionStorage:", error);
    }
  }
}, [movieId, selectedDate, selectedTime, currentShowtime]);




  



  // Cleanup
  useEffect(() => {
    return () => {
      if (heldSeats.length > 0 && currentShowtime?.id) {
        releaseSelectedSeats(currentShowtime.id, heldSeats);
      }
      clearCurrentMovie();
    };
  }, []);

  const unavailableSeats = getUnavailableSeats();
  const seatMap = formatSeatsToMap(seats);
  const seatRows = [...new Set(seats.map((s) => s.seat_row))].sort();
  const seatCols = [...new Set(seats.map((s) => s.seat_number))].sort((a, b) => a - b);

  const showtimePrice = toNumber(currentShowtime?.price || 0);
  const totalPrice = selectedSeats.reduce((total, seatId) => {
    const seatPrice = toNumber(getSeatPrice(seatId));
    return total + seatPrice + showtimePrice;
  }, 0);

  const toggleSeat = async (seatId) => {
    if (unavailableSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
    } else {
      if (currentShowtime?.id) {
        try {
          const result = await checkAvailability(currentShowtime.id, [seatId]);
          if (result.available) {
            setSelectedSeats((prev) => [...prev, seatId]);
          } else {
            alert("Ghế đã có người khác chọn!");
          }
        } catch {
          alert("Lỗi kiểm tra ghế. Vui lòng thử lại!");
        }
      }
    }
  };

  const formatTime = (t) => {
    if (!t) return "00:00";
    return new Date(t).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

const handleContinue = () => {
  if (selectedSeats.length === 0) return;

  const state = {
    movieId,
    selectedSeats,
    selectedDate,
    selectedTime,
    currentShowtimeId: currentShowtime?.id || null
  };

  console.log("➡️ Đang lưu và chuyển sang /food:", state);

  sessionStorage.setItem("bookingState", JSON.stringify(state));
  sessionStorage.setItem("seatHoldStartTime", Date.now());

  const params = new URLSearchParams({
    showtime_id: currentShowtime?.id || "",
    seats: selectedSeats.join(","),
    booking_total: totalPrice.toString(),
    raw_date: selectedDate || "",
    raw_time: selectedTime || "",
    formatted_date: formatDate(selectedDate),
    formatted_time: formatTime(selectedTime),
    movie_id: movieId || "",
    movie_title: currentMovie?.title || "Đang tải...",
    room_name: currentShowtime?.room?.name || `Phòng ${currentShowtime?.room_id}`,
    room_type: currentShowtime?.room?.type || "2D",
    rating: currentMovie?.age || "T16"
  });

  navigate(`/food?${params.toString()}`);
};






  const handleChangeShowtime = (newTime) => {
  // 🧹 Xoá ghế cũ & xoá sessionStorage
  setSelectedSeats([]);
  sessionStorage.removeItem("bookingState");
  sessionStorage.removeItem("seatHoldStartTime");

  navigate(`/booking/${movieId}?date=${selectedDate}&time=${newTime}`);
};


  const handleGoBack = () => {
    navigate(`/movies/${movieId}`);
  };

  const otherShowtimes = showtimes.filter((st) => {
    const d = new Date(st.start_time || st.show_time);
    const dateStr =
      d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    return dateStr === selectedDate && (st.start_time || st.show_time) !== selectedTime;
  });

  return {
    movieId,
    selectedSeats,
    currentShowtime,
    movieInfo: currentMovie,
    seats,
    seatMap,
    unavailableSeats,
    seatRows,
    seatCols,
    selectedDate,
    selectedTime,
    otherShowtimes,
    totalPrice,

    isLoading: seatsLoading || showtimesLoading || movieLoading,
    hasError: seatsError || showtimesError || movieError,
    seatsError,
    showtimesError,
    movieError,

    formatTime,
    formatDate,
    getSeatPrice: (id) => toNumber(getSeatPrice(id)),
    getTotalSeatPrice: (id) => toNumber(getSeatPrice(id)) + showtimePrice,

    toggleSeat,
    clearSelectedSeats: () => setSelectedSeats([]),
    handleContinue,
    handleGoBack,
    handleChangeShowtime
  };
};

export default useBooking1;
