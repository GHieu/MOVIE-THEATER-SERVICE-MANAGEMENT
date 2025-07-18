import React, { useEffect, useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useServicesMovie from "../hooks/useBookingServices";
import useMoviesUser from "../hooks/useMovieUser";
import useCountdownTimer from "../hooks/useCountdownTimer";
import CountdownTimer from "../components/FoodPageBooking/CountdownTimer";
import ServiceItem from "../components/FoodPageBooking/ServiceItem";
import BookingSidebar from "../components/BookingSidebar";
import ConfirmModal from "../components/ConfirmModal";

const FoodPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lấy dữ liệu từ URL hoặc sessionStorage
  const storedBooking = JSON.parse(sessionStorage.getItem("bookingData") || "{}");

  const showtimeId = searchParams.get("showtime_id") || storedBooking.showtimeId;
  const selectedSeats = searchParams.get("seats")?.split(',') || storedBooking.selectedSeats || [];
  const bookingTotal = parseFloat(searchParams.get("booking_total")) || storedBooking.bookingTotal || 0;

  const rawDate = searchParams.get("raw_date") || storedBooking.rawDate;
  const rawTime = searchParams.get("raw_time") || storedBooking.rawTime;
  const formattedDate = searchParams.get("formatted_date") || storedBooking.formattedDate;
  const formattedTime = searchParams.get("formatted_time") || storedBooking.formattedTime;

  const movieId = searchParams.get("movie_id") || storedBooking.movieId;
  const movieTitle = searchParams.get("movie_title") || storedBooking.movieTitle;
  const cinemaName = searchParams.get("cinema_name") || storedBooking.cinemaName;
  const roomName = searchParams.get("room_name") || storedBooking.roomName;
  const roomType = searchParams.get("room_type") || storedBooking.roomType;
  const age = searchParams.get("rating") || storedBooking.age;
  
  // Hooks
 const { services, loading: servicesLoading, error: servicesError, selectedServices, handleServiceChange, calculateServiceTotal, resetSelectedServices } = useServicesMovie();
  
  const { currentMovie, loadMovieById, movieLoading } = useMoviesUser();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    console.log('🔍 DEBUG - FoodPage mounted, resetting selectedServices');
    resetSelectedServices();
  }, [resetSelectedServices]);
  // Callback khi hết thời gian
  const handleTimeExpired = useCallback(() => {
    alert("Thời gian giữ ghế đã hết! Bạn sẽ được chuyển về trang chọn ghế.");

    try {
      const stored = sessionStorage.getItem("bookingData");
      if (stored) {
        const parsed = JSON.parse(stored);
        delete parsed.services;
        delete parsed.servicesList;
        delete parsed.selectedSeats;
        sessionStorage.setItem("bookingData", JSON.stringify(parsed));
      }
    } catch (e) {
      console.error("Lỗi khi xóa dịch vụ trong handleTimeExpired:", e);
    }
    sessionStorage.removeItem("bookingData");
    sessionStorage.removeItem("bookingState");
    sessionStorage.removeItem("seatHoldStartTime");
    sessionStorage.removeItem("lastBookingInfo");

    navigate(`/booking/${movieId}?date=${rawDate}&time=${rawTime}`);
  }, [movieId, rawDate, rawTime, navigate]);

  // Countdown timer hook
  const MAX_HOLD_TIME = 3 * 60; 
  const seatHoldStartTime = parseInt(sessionStorage.getItem("seatHoldStartTime"), 10);
  const now = Date.now();
  const elapsed = Math.floor((now - seatHoldStartTime) / 1000);
  const remainingTime = Math.max(0, MAX_HOLD_TIME - elapsed);

  const { timeLeft, isExpired } = useCountdownTimer(
    remainingTime,
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

  const posterUrl = currentMovie?.poster instanceof File
    ? URL.createObjectURL(currentMovie.poster)
    : currentMovie?.poster;

  // ✅ CHỈ LƯU bookingData khi bấm "Tiếp tục"
  const handleContinue = () => {
    if (isExpired) return;

    console.log('🔍 DEBUG - FoodPage handleContinue:', { selectedServices, serviceTotal });

    const validServices = Object.entries(selectedServices)
      .filter(([_, quantity]) => quantity > 0 && Number.isInteger(Number(quantity)))
      .reduce((acc, [service_id, quantity]) => {
        acc[service_id] = quantity;
        return acc;
      }, {});

    const bookingData = {
      poster: posterUrl,
      movieTitle,
      cinemaName,
      age,
      formattedDate,
      formattedTime,
      rawDate,
      rawTime,
      selectedSeats,
      services: validServices,
      servicesList: services,
      serviceTotal,
      bookingTotal,
      finalTotal,
      timeLeft,
      movieId,
      roomName,
      roomType,
      showtimeId,
    };

    console.log('🔍 DEBUG - Saving to sessionStorage:', bookingData);
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
    navigate("/payment", { state: bookingData });
  };

  // ✅ Tạo bookingData cho sidebar (không lưu vào sessionStorage)
  const sidebarBookingData = {
    poster: currentMovie?.poster,
    age,
    movieTitle,
    cinemaName,
    formattedDate,
    formattedTime,
    rawDate,
    rawTime,
    selectedSeats,
    services: selectedServices,
    servicesList: services,
    serviceTotal,
    bookingTotal,
    finalTotal,
    timeLeft,
    movieId,
    roomName,
    roomType,
    showtimeId,
  };

  // ✅ XÓA phần lưu bookingData tự động - không cần thiết

  if (servicesLoading || movieLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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

  const handleConfirmGoBack = () => {
    // ✅ Xóa services khỏi bookingData khi quay lại
    const stored = sessionStorage.getItem("bookingData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        delete parsed.services;
        delete parsed.servicesList;
        delete parsed.serviceTotal;
        // ✅ Cập nhật finalTotal về bookingTotal gốc
        parsed.finalTotal = parsed.bookingTotal;
        sessionStorage.setItem("bookingData", JSON.stringify(parsed));
      } catch (e) {
        console.error("Lỗi khi xóa dịch vụ:", e);
      }
    }

    // ✅ Không xóa seatHoldStartTime và lastBookingInfo để giữ trạng thái ghế
    // sessionStorage.removeItem('seatHoldStartTime');
    // sessionStorage.removeItem('lastBookingInfo');
    
    navigate(`/booking/${movieId}?date=${rawDate}&time=${rawTime}`);
  };

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
        
        <BookingSidebar
          poster={sidebarBookingData.poster}
          movieTitle={sidebarBookingData.movieTitle}
          age={sidebarBookingData.age}
          roomName={sidebarBookingData.roomName}
          roomType={sidebarBookingData.roomType}
          formattedTime={sidebarBookingData.formattedTime}
          formattedDate={sidebarBookingData.formattedDate}
          selectedSeats={sidebarBookingData.selectedSeats}
          bookingTotal={sidebarBookingData.bookingTotal}
          services={services}
          selectedServices={selectedServices}
          serviceTotal={sidebarBookingData.serviceTotal}
          finalTotal={sidebarBookingData.finalTotal}
          isExpired={isExpired}
          onGoBack={() => setIsConfirmOpen(true)}
          onContinue={handleContinue}
        />

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmGoBack}
          title="Xác nhận quay lại"
          message="Bạn có chắc muốn quay lại trang chọn ghế? Các dịch vụ đã chọn sẽ bị xoá 😭😭😭😭😭😭😭😭😭😭😭😭"
        />
      </div>
    </div>
  );
};

export default FoodPage;