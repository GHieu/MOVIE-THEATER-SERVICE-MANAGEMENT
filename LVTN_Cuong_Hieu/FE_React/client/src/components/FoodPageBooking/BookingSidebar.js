import React from 'react';

const BookingSidebar = ({ 
  currentMovie, 
  movieTitle, 
  roomType, 
  rating, 
  roomName, 
  formattedTime, 
  formattedDate, 
  selectedSeats, 
  bookingTotal, 
  selectedServices, 
  services, 
  serviceTotal, 
  finalTotal, 
  isExpired, 
  onGoBack, 
  onContinue 
}) => {
  return (
    <div className="w-full lg:w-[300px] bg-white rounded border p-4 sticky top-4 h-fit">
      {/* Movie info */}
      <div className="flex gap-4 mb-4">
        <img
          src={currentMovie?.poster || "https://via.placeholder.com/80x112?text=Movie"}
          alt="poster"
          className="w-20 h-28 object-cover rounded"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/80x112?text=Movie";
          }}
        />
        <div>
          <h3 className="font-semibold text-sm">
            {movieTitle || currentMovie?.title || "Đang tải..."}
          </h3>
          <p className="text-sm">
            {roomType || "2D"} -{" "}
            <span className="bg-orange-400 text-white px-2 py-0.5 rounded text-xs">
              {rating || currentMovie?.age || "T16"}
            </span>
          </p>
        </div>
      </div>
      
      <div className="text-sm text-gray-700 space-y-1 mb-4">
        <p className="font-medium">{roomName || "Phòng chưa xác định"}</p>
        <p>
          Suất: <span className="font-semibold">{formattedTime}</span> - {formattedDate}
        </p>
      </div>

      <hr className="my-4" />

      {/* Thông tin ghế */}
      <div className="text-sm text-gray-800 mb-4">
        <div className="font-semibold mb-1">
          {selectedSeats.length}x Ghế đã chọn:
        </div>
        <div className="text-gray-600">
          Ghế: {selectedSeats.join(", ")}
        </div>
        <div className="text-right font-semibold mt-1">
          {bookingTotal.toLocaleString("vi-VN")} ₫
        </div>
      </div>

      {/* Thông tin dịch vụ */}
      {Object.keys(selectedServices).length > 0 && (
        <div className="text-sm text-gray-800 mb-4">
          <hr className="my-4" />
          <div className="font-semibold mb-2">Dịch vụ đã chọn:</div>
          {Object.entries(selectedServices).map(([serviceId, count]) => {
            const service = services.find(s => s.id === parseInt(serviceId));
            return (
              <div key={serviceId} className="flex justify-between mb-1">
                <span className="text-xs">{count}x {service?.name}</span>
              </div>
            );
          })}
          <div className="text-right font-semibold mt-1">
            {serviceTotal.toLocaleString("vi-VN")} ₫
          </div>
        </div>
      )}

      {/* Tổng cộng */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Tổng cộng:</span>
          <span className="text-orange-600">
            {finalTotal.toLocaleString("vi-VN")} ₫
          </span>
        </div>
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
          className={`flex-1 px-4 py-2 rounded font-semibold ${
            isExpired 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
          disabled={isExpired}
        >
          {isExpired ? 'Hết thời gian' : 'Tiếp tục'}
        </button>
      </div>
    </div>
  );
};

export default BookingSidebar;