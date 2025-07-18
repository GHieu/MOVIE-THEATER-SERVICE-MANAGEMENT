import React from 'react';

const BookingSidebar = ({
  poster,
  movieTitle,
  age,
  roomName,
  roomType,
  formattedTime,
  formattedDate,
  selectedSeats = [],
  bookingTotal = 0,
  services = {},
  selectedServices = {},
  serviceTotal = 0,
  finalTotal,
  isExpired = false,
  onGoBack,
  onContinue,
  buttonLabel = "Tiếp tục",          // Thêm mặc định
  onContinueClicking = null,
}) => {
 
const translateRoomType = (roomType) => {
    const roomTypeMap = {
      '2Dsub': '2D Phụ đề',
      '2Dcap': '2D Lồng tiếng',
      '3Dsub': '3D Phụ đề',
      '3Dcap': '3D Lồng tiếng',
      'IMAXsub': 'IMAX Phụ đề',
      'IMAXcap': 'IMAX Lồng tiếng',
      // Các loại phòng khác
      'Standard': 'Phòng tiêu chuẩn',
      'VIP': 'Phòng VIP',
      'Premium': 'Phòng cao cấp',
      'Gold': 'Phòng Gold',
      'Platinum': 'Phòng Platinum',
      'Director': 'Phòng đạo diễn',
      'Couple': 'Phòng đôi',
      'Family': 'Phòng gia đình'
    };
    
    return roomTypeMap[roomType] || roomType || 'Khác';
  };


  return (
    <div className="w-full lg:w-[320px] bg-white rounded border p-4 sticky top-4 h-fit">
      {/* Movie Info */}
      <div className="flex gap-4 mb-4">
        <img
          src={poster || "https://via.placeholder.com/80x112?text=Movie"}
          alt="poster"
          className="w-20 h-28 object-cover rounded"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-sm leading-tight">{movieTitle}</h3>
          <p className="text-sm mt-1">
            {translateRoomType(roomType)} - {" "}
            <span className="bg-orange-400 text-white px-2 py-0.5 rounded text-xs">
              {age}
            </span>
          </p>
        </div>
      </div>

      {/* Showtime Info */}
      <div className="text-sm text-gray-700 space-y-1 mb-4">
        <p className="font-medium">{roomName}</p>
        <p>
          Suất: <span className="font-semibold">{formattedTime}</span> - {formattedDate}
        </p>
      </div>

      <hr className="my-4" />

      {/* Seats */}
      <div className="text-sm mb-4">
        <div className="font-semibold mb-1">{selectedSeats.length}x Ghế đã chọn:</div>
        <div className="text-xs text-gray-600">Ghế: {selectedSeats.join(", ")}</div>
        <div className="text-right font-semibold mt-1">
          {bookingTotal.toLocaleString("vi-VN")} ₫
        </div>
      </div>

      {/* Services */}
      
            {/* Services - Hiển thị nếu có dịch vụ được chọn */}
              {services && selectedServices && Object.values(selectedServices).some(qty => qty > 0) && (
                <>
                  <hr className="my-4" />
                  <div className="text-sm mb-4">
                    <div className="font-semibold mb-2">Dịch vụ đã chọn:</div>
                    {services
                      .filter((s) => selectedServices[s.id] > 0)
                      .map((s) => (
                        <div key={s.id} className="flex justify-between text-xs">
                          <span>{selectedServices[s.id]}x {s.name}</span>
                          <span>{(s.price * selectedServices[s.id]).toLocaleString("vi-VN")} ₫</span>
                        </div>
                      ))}
                    <div className="text-right font-semibold mt-1">
                      {serviceTotal.toLocaleString("vi-VN")} ₫
                    </div>
                  </div>
                </>
              )}







            
     

      {/* Total */}
      <div className="flex justify-between text-sm mb-6 py-2 border-t">
        <span className="font-semibold">Tổng cộng</span>
        <span className="text-orange-600 font-bold text-lg">
          {(finalTotal || bookingTotal + serviceTotal).toLocaleString("vi-VN")} ₫
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
          onClick={() => {
            if (onContinueClicking) onContinueClicking(); // ✅ gọi thêm khi click
            onContinue(); // gọi hàm chính
          }}
          disabled={isExpired}
          className={`flex-1 py-2 px-4 rounded font-semibold ${
            isExpired
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isExpired ? 'Hết thời gian' : buttonLabel} {/* ✅ đổi label nút */}
        </button>

      </div>
    </div>
  );
};

export default BookingSidebar;
