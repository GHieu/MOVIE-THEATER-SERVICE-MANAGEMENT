// BookingPage.js - Refactored version
import React from "react";
import useBooking from "../hooks/useBooking1";
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

const BookingPage = () => {
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

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (hasError) {
    const errorMessage = seatsError || showtimesError || movieError;
    return <ErrorState error={errorMessage} onGoBack={handleGoBack} />;
  }

  // No showtime found
  if (!currentShowtime) {
    return (
      <NoDataState 
        message="Không tìm thấy suất chiếu phù hợp" 
        onGoBack={handleGoBack} 
      />
    );
  }

  // No seats data
  if (!seats || seats.length === 0) {
    return (
      <NoDataState 
        message="Không có dữ liệu ghế cho phòng này" 
        onGoBack={handleGoBack} 
      />
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      {/* Left content */}
      <div className="flex-1">
        <BookingShowInfo
          movieInfo={movieInfo}
          currentShowtime={currentShowtime}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          formatDate={formatDate}
          formatTime={formatTime}
        />

        <ShowtimeSelector
          otherShowtimes={otherShowtimes}
          selectedTime={selectedTime}
          formatTime={formatTime}
          onChangeShowtime={handleChangeShowtime}
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

      {/* Right sidebar */}
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
  );
};

export default BookingPage;