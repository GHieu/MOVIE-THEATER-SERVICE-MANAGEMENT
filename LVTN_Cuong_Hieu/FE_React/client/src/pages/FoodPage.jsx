import React, { useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useServicesMovie from "../hooks/useServicesMovie";
import useMoviesUser from "../hooks/useMovieUser";
import useCountdownTimer from "../hooks/useCountdownTimer";
import CountdownTimer from "../components/FoodPageBooking/CountdownTimer";
import ServiceItem from "../components/FoodPageBooking/ServiceItem";
import BookingSidebar from "../components/FoodPageBooking/BookingSidebar";

const FoodPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lấy thông tin từ URL params
  const showtimeId = searchParams.get("showtime_id");
  const selectedSeats = searchParams.get("seats")?.split(',') || [];
  const bookingTotal = parseFloat(searchParams.get("booking_total")) || 0;
  
  const rawDate = searchParams.get("raw_date");
  const rawTime = searchParams.get("raw_time");
  const formattedDate = searchParams.get("formatted_date");
  const formattedTime = searchParams.get("formatted_time");
  
  const movieId = searchParams.get("movie_id");
  const movieTitle = searchParams.get("movie_title");
  const cinemaName = searchParams.get("cinema_name");
  const roomName = searchParams.get("room_name");
  const roomType = searchParams.get("room_type");
  const rating = searchParams.get("rating");

  // Hooks
  const { 
    services, 
    loading: servicesLoading, 
    error: servicesError,
    selectedServices,
    handleServiceChange,
    calculateServiceTotal
  } = useServicesMovie();
  
  const { currentMovie, loadMovieById, movieLoading } = useMoviesUser();

  // Callback khi hết thời gian
  const handleTimeExpired = useCallback(() => {
    alert("Thời gian giữ ghế đã hết! Bạn sẽ được chuyển về trang chọn ghế.");
    
      navigate(`/booking/${movieId || 'default'}`, {
        state: {
          date: rawDate,
          time: rawTime,
          showtime: showtimeId,
        }
      });
  }, []);

  // Countdown timer hook
  const { timeLeft, isExpired } = useCountdownTimer(
    5 * 60, // 5 phút
    handleTimeExpired,
    [showtimeId, selectedSeats]
  );

  // Load movie info
  useEffect(() => {
    if (movieId && !currentMovie) {
      loadMovieById(movieId);
    }
  }, [movieId, currentMovie, loadMovieById]);

  // Xử lý thay đổi số lượng service
  const onServiceQuantityChange = useCallback((serviceId, delta) => {
    handleServiceChange(serviceId, delta, isExpired);
  }, [handleServiceChange, isExpired]);

  // Tính tổng dịch vụ
  const serviceTotal = calculateServiceTotal();
  
  // Tổng cộng cuối cùng = tổng booking + tổng dịch vụ
  const finalTotal = bookingTotal + serviceTotal;

  const handleContinue = () => {
    if (isExpired) return;

    navigate('/payment', {
    state: {
    movieTitle,
    cinemaName,
    formattedDate,
    formattedTime,
    selectedSeats,
    services: selectedServices,
    serviceTotal,
    bookingTotal,
    finalTotal,
    timeLeft
  }
});

  };

  const handleGoBack = () => {
    // Xóa thông tin booking hiện tại khi quay lại (để có thể chọn lại)
    sessionStorage.removeItem('seatHoldStartTime');
    sessionStorage.removeItem('lastBookingInfo');
    
    
    navigate(`/booking/${movieId || 'default'}`, {
      state: {
        date: rawDate,
        time: rawTime,
        showtime: showtimeId,
      }
    });

  };

  if (servicesLoading || movieLoading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="text-center text-red-500">
          Lỗi tải dịch vụ: {servicesError}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      {/* Services list */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4">Chọn Combo / Sản phẩm</h2>
        
        

        {services.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Hiện tại chưa có dịch vụ nào
          </div>
        ) : (
          services.map((service) => (
            <ServiceItem 
              key={service.id}
              service={service}
              selectedQuantity={selectedServices[service.id]}
              onQuantityChange={onServiceQuantityChange}
              isExpired={isExpired}
            />
          ))
        )}
      </div>
        
     
      <div>
        {/* Countdown Timer và Warning */}
        <CountdownTimer timeLeft={timeLeft} />
        
         {/* Sidebar */}
        <BookingSidebar 
          currentMovie={currentMovie}
          movieTitle={movieTitle}
          roomType={roomType}
          rating={rating}
          roomName={roomName}
          formattedTime={formattedTime}
          formattedDate={formattedDate}
          selectedSeats={selectedSeats}
          bookingTotal={bookingTotal}
          selectedServices={selectedServices}
          services={services}
          serviceTotal={serviceTotal}
          finalTotal={finalTotal}
          isExpired={isExpired}
          onGoBack={handleGoBack}
          onContinue={handleContinue}
        />
      </div>
    </div>
  );
};

export default FoodPage;