// components/BookingShowInfo.js
import React from 'react';

const BookingShowInfo = ({ 
  movieInfo, 
  currentShowtime, 
  selectedDate, 
  selectedTime, 
  formatDate, 
  formatTime 
}) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h1 className="text-2xl font-bold mb-2">Đặt vé xem phim</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-semibold">Phim:</span> {movieInfo.title}
        </div>
        <div>
          <span className="font-semibold">Rạp:</span> {currentShowtime.cinema?.name || "AbsoluteCinema"}
        </div>
        <div>
          <span className="font-semibold">Phòng:</span> {currentShowtime.room?.name || `Phòng ${currentShowtime.room_id}`}
        </div>
        <div>
          <span className="font-semibold">Ngày:</span> {formatDate(selectedDate)}
        </div>
        <div>
          <span className="font-semibold">Giờ chiếu:</span> {formatTime(selectedTime)}
        </div>
        <div>
          <span className="font-semibold">Định dạng:</span> {currentShowtime.room?.type}
        </div>
      </div>
    </div>
  );
};

// components/ShowtimeSelector.js
const ShowtimeSelector = ({ 
  otherShowtimes, 
  selectedTime, 
  formatTime, 
  onChangeShowtime 
}) => {
  if (otherShowtimes.length === 0) return null;

  // Tạo danh sách tất cả suất chiếu, bao gồm suất hiện tại
  const allShowtimes = [
    ...otherShowtimes,
    { id: 'current', start_time: selectedTime, show_time: selectedTime }
  ].sort((a, b) => {
    const timeA = a.start_time || a.show_time;
    const timeB = b.start_time || b.show_time;
    return new Date(timeA) - new Date(timeB); // Sắp xếp theo thời gian tăng dần
  });

  return (
    <div className="mb-4">
      <h2 className="font-semibold text-lg mb-2">Đổi suất chiếu</h2>
      <div className="flex gap-2 flex-wrap">
        {allShowtimes.slice(0, 10).map((showtime) => {
          const time = showtime.start_time || showtime.show_time;
          const isSelected = time === selectedTime;

          return (
            <button
              key={showtime.id}
              onClick={() => onChangeShowtime(time)}
              className={`px-4 py-2 rounded border font-semibold ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'border-blue-600 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {formatTime(time)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// components/SeatButton.js
const SeatButton = ({ 
  seatId, 
  col, 
  seatInfo, 
  isSelected, 
  onToggle 
}) => {
  if (!seatInfo) {
    return <div key={seatId} className="w-8 h-8 m-1" />;
  }

  const isUnavailable = seatInfo.status !== 'available';
  const isVip = seatInfo.type === 'vip';
  const isCouple = seatInfo.type === 'couple';
  const isBroken = seatInfo.status === 'broken';
  
  // Ghế couple có width gấp đôi
  const widthClass = isCouple ? 'w-16' : 'w-8';
  
  return (
    <button
      key={seatId}
      onClick={() => onToggle(seatId)}
      className={`${widthClass} h-8 m-1 rounded border text-sm font-semibold transition-all flex items-center justify-center ${
        isBroken
          ? "bg-gray-200 border-gray-400 cursor-not-allowed text-gray-500 opacity-30"
          : isUnavailable
          ? "bg-red-200 border-red-400 cursor-not-allowed opacity-50"
          : isSelected
          ? "bg-orange-500 text-white shadow-md"
          : isCouple
          ? "bg-pink-100 border-pink-400 hover:bg-pink-200"
          : isVip
          ? "bg-yellow-100 border-yellow-400 hover:bg-yellow-200"
          : "bg-blue-100 border-blue-400 hover:bg-blue-200"
      }`}
      disabled={isUnavailable}
      title={`Ghế ${seatId} - ${seatInfo.price.toLocaleString('vi-VN')}đ${isVip ? ' (VIP)' : isCouple ? ' (Couple)' : ''} + Giá suất chiếu`}
    >
      {isCouple ? '💕' : col}
    </button>
  );
};

// components/SeatMap.js
const SeatMap = ({ 
  seatRows, 
  seatCols, 
  seatMap, 
  selectedSeats, 
  onToggleSeat 
}) => {
  return (
    <div className="bg-white p-4 rounded border">
      {/* Màn hình */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-8 rounded-lg inline-block shadow-lg">
          <div className="text-lg font-bold">MÀN HÌNH</div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {seatRows.map((row) => (
          <div key={row} className="flex items-center mb-2">
            <div className="w-6 mr-2 text-right font-semibold">{row}</div>
            {seatCols.map((col) => {
              const seatId = `${row}${col}`;
              const seatInfo = seatMap[seatId];
              const isSelected = selectedSeats.includes(seatId);
              
              return (
                <SeatButton
                  key={seatId}
                  seatId={seatId}
                  col={col}
                  seatInfo={seatInfo}
                  isSelected={isSelected}
                  onToggle={onToggleSeat}
                />
              );
            })}
            <div className="w-6 ml-2 text-left font-semibold">{row}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// components/SeatLegend.js
const SeatLegend = () => {
  return (
    <div className="flex flex-wrap  gap-4 mb-6 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
        <span>Standard</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
        <span>VIP</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-4 bg-pink-100 border-2 border-pink-400 rounded flex items-center justify-center text-xs">💕</div>
        <span>Couple</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-orange-500 rounded"></div>
        <span>Ghế đang chọn</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded opacity-50"></div>
        <span>Đã đặt</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded opacity-30"></div>
        <span>Hỏng</span>
      </div>
    </div>
  );
};

// components/BookingSidebar.js
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

// components/LoadingState.js
const LoadingState = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">Đang tải thông tin đặt vé...</div>
    </div>
  );
};

// components/ErrorState.js
const ErrorState = ({ error, onGoBack }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-red-600 text-lg">
        Lỗi: {error}
        <br />
        <button 
          onClick={onGoBack}
          className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

// components/NoDataState.js
const NoDataState = ({ message, onGoBack }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="text-gray-600 text-lg mb-4">
          {message}
        </div>
        <button 
          onClick={onGoBack}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export {
  BookingShowInfo,
  ShowtimeSelector,
  SeatMap,
  SeatLegend,
  BookingSidebar,
  LoadingState,
  ErrorState,
  NoDataState
};