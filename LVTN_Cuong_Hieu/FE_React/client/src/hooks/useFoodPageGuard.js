import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const useFoodPageGuard = (movieId) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const storedBooking = JSON.parse(sessionStorage.getItem("bookingData") || "{}");
    
    // Lấy các field cần thiết từ URL params hoặc sessionStorage
    const showtimeId = searchParams.get("showtime_id") || storedBooking.showtimeId;
    const selectedSeats = searchParams.get("seats")?.split(',') || storedBooking.selectedSeats || [];
    const bookingTotal = parseFloat(searchParams.get("booking_total")) || storedBooking.bookingTotal || 0;
    const currentMovieId = searchParams.get("movie_id") || storedBooking.movieId || movieId;
    const rawDate = searchParams.get("raw_date") || storedBooking.rawDate;
    const rawTime = searchParams.get("raw_time") || storedBooking.rawTime;

    // Kiểm tra các field bắt buộc
    const hasRequiredData = showtimeId && 
                           selectedSeats.length > 0 && 
                           bookingTotal > 0 && 
                           currentMovieId &&
                           rawDate &&
                           rawTime;

    if (!hasRequiredData) {
      console.warn("🚫 Thiếu dữ liệu bắt buộc cho trang Food, điều hướng về trang booking");
      console.warn("📊 Dữ liệu hiện có:", {
        showtimeId,
        selectedSeats,
        bookingTotal,
        currentMovieId,
        rawDate,
        rawTime
      });
      
      // Chuyển về trang booking với movie ID
      const fallbackUrl = `/booking/${currentMovieId || movieId}`;
      navigate(fallbackUrl);
    }
  }, [movieId, navigate, searchParams]);
};

export default useFoodPageGuard;