// BookingPage.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useBooking from "../hooks/useBookingSeat";
import {
  BookingShowInfo,
  ShowtimeSelector,
  SeatMap,
  SeatLegend,
  BookingSidebar,
  LoadingState,
  ErrorState,
  NoDataState
} from "../components/BookingInfo/BookingShowInfo";

// Component Popup thông báo hết vé
const TicketSoldOutPopup = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Hết vé!
          </h2>
          <p className="text-gray-600 mb-6">
            Suất chiếu này đã kết thúc. Vui lòng chọn suất chiếu khác.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Chọn suất khác
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  
 
  
  // Thử các cách lấy movieId khác nhau
  const movieId = params.id || params.movieId || params.movie_id || 
                  window.location.pathname.split('/').pop();
  
  console.log('MovieId resolved:', movieId);
  
  const [showSoldOutPopup, setShowSoldOutPopup] = useState(false);
  
  const {
    // State
    selectedSeats,
    currentShowtime,
    movieInfo,
    
    // Computed values
    seatMap,
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
    
    // Utility functions
    formatTime,
    formatDate,
    getSeatPrice,
    getTotalSeatPrice,
    
    // Event handlers
    toggleSeat,
    clearSelectedSeats,
    handleContinue,
    handleGoBack,
    handleChangeShowtime
  } = useBooking();

  // Hàm kiểm tra thời gian hết vé
  const checkTicketAvailability = () => {
    if (!currentShowtime) return true;
    
    const now = new Date();
    const endTime = new Date(currentShowtime.end_time);
    
    return now <= endTime;
  };

  // Effect để kiểm tra thời gian khi component mount hoặc currentShowtime thay đổi
  useEffect(() => {
    if (currentShowtime && !checkTicketAvailability()) {
      setShowSoldOutPopup(true);
    }
  }, [currentShowtime]);

  // Handlers cho popup
  const handleClosePopup = () => {
    setShowSoldOutPopup(false);
  };

  const handleConfirmPopup = () => {
    setShowSoldOutPopup(false);
    // Debug: Kiểm tra movieId trước khi navigate
    console.log('Navigating to movie:', movieId);
    
    if (movieId) {
      // Chuyển về trang movie detail
      navigate(`/movies/${movieId}`);
    } else {
      // Fallback nếu không có movieId
      navigate('/movies');
    }
  };

  // Loading
  if (isLoading) return <LoadingState />;

  // Error
  if (hasError) {
    const errorMessage = seatsError || showtimesError || movieError;
    return <ErrorState error={errorMessage} onGoBack={handleGoBack} />;
  }
  
  // Không có suất chiếu
  if (!currentShowtime) {
    return (
      <NoDataState 
        message="Không tìm thấy suất chiếu phù hợp" 
        onGoBack={handleGoBack} 
      />
    );
  }

  // Không có ghế
  if (!seats || seats.length === 0) {
    return (
      <NoDataState 
        message="Không có dữ liệu ghế cho phòng này" 
        onGoBack={handleGoBack} 
      />
    );
  }

  // Kiểm tra thời gian hết vé trong render
  if (!checkTicketAvailability()) {
    return (
      <>
        <NoDataState 
          message="Suất chiếu này đã kết thúc" 
          onGoBack={handleGoBack} 
        />
        <TicketSoldOutPopup
          isOpen={showSoldOutPopup}
          onClose={handleClosePopup}
          onConfirm={handleConfirmPopup}
        />
      </>
    );
  }
  
  return (
    <>
      <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Vùng chọn ghế */}
        <div className="flex-1">
          <ShowtimeSelector
            otherShowtimes={otherShowtimes}
            selectedTime={selectedTime}
            formatTime={formatTime}
            onChangeShowtime={handleChangeShowtime}
            currentShowtime={currentShowtime} // Thêm prop này
          />

          <SeatMap
            seatRows={seatRows}
            seatCols={seatCols}
            seatMap={seatMap}
            selectedSeats={selectedSeats}
            onToggleSeat={toggleSeat}
          />

          <SeatLegend />
        </div>

        {/* Sidebar tổng kết */}
        <BookingSidebar
          movieInfo={movieInfo}
          currentShowtime={currentShowtime}
          selectedSeats={selectedSeats}
          selectedTime={selectedTime}
          selectedDate={selectedDate}
          totalPrice={totalPrice}
          formatTime={formatTime}
          formatDate={formatDate}
          getSeatPrice={getSeatPrice}
          getTotalSeatPrice={getTotalSeatPrice}
          onClearSeats={clearSelectedSeats}
          onContinue={handleContinue}
          onGoBack={handleGoBack}
        />
      </div>

      {/* Popup thông báo hết vé */}
      <TicketSoldOutPopup
        isOpen={showSoldOutPopup}
        onClose={handleClosePopup}
        onConfirm={handleConfirmPopup}
      />
    </>
  );
};

export default BookingPage;