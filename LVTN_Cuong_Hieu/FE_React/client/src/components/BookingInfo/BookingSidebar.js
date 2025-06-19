// components/BookingSidebar.js
import React from 'react';

const BookingSidebar = ({ 
  movieInfo, 
  currentShowtime, 
  selectedSeats, 
  selectedTime, 
  selectedDate, 
  totalPrice,
  formatTime,
  formatDate,
  getSeatPrice,
  getTotalSeatPrice,
  getSeatInfo, // Thêm function để lấy thông tin ghế
  onClearSeats,
  onContinue,
  onGoBack
}) => {
  const showtimePrice = currentShowtime?.price || 0;

  return (
    <div className="w-full lg:w-[320px] bg-white rounded border p-4 sticky top-4 h-fit">
      <div className="flex gap-4 mb-4">
        <img
          src={movieInfo.poster}
          alt="poster"
          className="w-20 h-28 object-cover rounded"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-sm leading-tight">{movieInfo.title}</h3>
          <p className="text-sm mt-1">
            {currentShowtime.room?.type} -{" "}
            <span className="bg-orange-400 text-white px-2 py-0.5 rounded text-xs">
              {movieInfo.age}
            </span>
          </p>
        </div>
      </div>
      
      <div className="text-sm text-gray-700 space-y-1 mb-4">
        <p className="font-medium">{currentShowtime.room?.name || `Phòng ${currentShowtime.room_id}`}</p>
        <p>
          Suất:{" "}
          <span className="font-semibold">{formatTime(selectedTime)}</span> -{" "}
          {formatDate(selectedDate)}
        </p>
        
      </div>
      
      <hr className="my-4" />
      
      <div className="text-sm mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">{selectedSeats.length} Ghế đã chọn</span>
          {selectedSeats.length > 0 && (
            <button 
              onClick={onClearSeats}
              className="text-red-500 text-xs hover:underline"
            >
              Bỏ chọn tất cả
            </button>
          )}
        </div>
        
        {selectedSeats.length > 0 ? (
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              Ghế: {selectedSeats.join(", ")}
            </div>
            <div  className="space-y-1">   
                    <div className="text-right font-semibold mt-1">
                        {totalPrice.toLocaleString("vi-VN")} ₫
                    </div>
                </div>
            
          </div>
        ) : (
          <div className="text-xs text-gray-500">Chưa chọn ghế nào</div>
        )}
      </div>
      
      <div className="flex justify-between text-sm mb-6 py-2 border-t">
        <span className="font-semibold">Tổng cộng</span>
        <span className="text-orange-600 font-bold text-lg">
          {totalPrice.toLocaleString("vi-VN")} ₫
        </span>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={onGoBack}
          className="flex-1 text-orange-500 font-semibold py-2 px-4 border border-orange-500 rounded hover:bg-orange-50"
        >
          Quay lại
        </button>
        <button 
          onClick={onContinue}
          className={`flex-1 py-2 px-4 rounded font-semibold ${
            selectedSeats.length === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
          disabled={selectedSeats.length === 0}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default BookingSidebar;