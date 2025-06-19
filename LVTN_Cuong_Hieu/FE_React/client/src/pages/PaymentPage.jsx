import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";


const paymentMethods = [
  { id: "onepay", label: "OnePay - Visa, Master, JCB,… / ATM / QR Ngân hàng / Apple Pay", logo: "https://www.onepay.vn/themes/onepay/images/logo.png" },
  { id: "shopeepay", label: "Ví ShopeePay – Giảm 5K mỗi đơn khi thanh toán", logo: "https://upload.wikimedia.org/wikipedia/vi/f/f8/ShopeePay_Logo.png" },
  { id: "momo", label: "Ví điện tử MoMo", logo: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" },
  { id: "zalo", label: "ZaloPay – Giảm 50% tối đa 40K", logo: "https://upload.wikimedia.org/wikipedia/vi/e/e5/ZaloPay-logo.png" },
];

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state;

  const [voucher, setVoucher] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("onepay");
  const [isProcessing, setIsProcessing] = useState(false);


  const {
    movieTitle,
    cinemaName,
    formattedDate,
    formattedTime,
    selectedSeats,
    services,
    serviceTotal,
    bookingTotal,
    finalTotal,
    timeLeft
  } = stateData || {};


  // Kiểm tra dữ liệu khi component mount
  useEffect(() => {
    console.log('PaymentPage mounted, checking booking data...');

    
    if (!movieTitle || !selectedSeats || selectedSeats.length === 0 || timeLeft <= 0) {
      navigate('/movies');
      return null;
    }


    // Kiểm tra thời gian còn lại
    if (timeLeft <= 0) {
      console.log('Time expired, redirecting to booking...');
      alert('Thời gian giữ ghế đã hết. Vui lòng đặt vé lại.');
      navigate('/booking');
      return;
    }
  }, [ navigate, timeLeft]);

  // Format thời gian còn lại
  const formatTimeLeft = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Xử lý thanh toán
  const handlePayment = () => {
    if (isProcessing) return;
    
    if (timeLeft <= 0) {
      alert('Thời gian giữ ghế đã hết. Vui lòng đặt vé lại.');
      navigate('/order-success');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      console.log('Payment completed, clearing booking data...');
   
      navigate('/order-success');
    }, 1000);
  };

  // Hiển thị services đã chọn
  const renderSelectedServices = () => {
    if (!services || Object.keys(services).length === 0) {
      return null;
    }

    const serviceEntries = Object.entries(services).filter(([_, count]) => count > 0);
    if (serviceEntries.length === 0) return null;

    const totalItems = serviceEntries.reduce((sum, [_, count]) => sum + count, 0);

    return (
      <div className="text-sm text-gray-800 mb-1">
        <strong>{totalItems}x</strong> Combo<br />
        {serviceEntries.map(([serviceId, count]) => (
          <span key={serviceId}>{count}x Combo {serviceId}, </span>
        ))}
      </div>
    );
  };


  
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Khuyến mãi</h2>
          <div className="flex gap-2 mb-1">
            <input
              type="text"
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              placeholder="Mã khuyến mãi"
              className="border p-2 rounded w-full"
              disabled={isProcessing}
            />
            <button 
              className="bg-orange-500 text-white px-4 rounded disabled:opacity-50"
              disabled={isProcessing}
            >
              Áp Dụng
            </button>
          </div>
          <p className="text-sm text-gray-500">Lưu ý: Có thể áp dụng nhiều vouchers vào 1 lần thanh toán</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Phương thức thanh toán</h2>
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className="flex items-center gap-3 p-3 border rounded mb-3 cursor-pointer"
            >
              <input
                type="radio"
                name="payment"
                checked={selectedMethod === method.id}
                onChange={() => setSelectedMethod(method.id)}
                disabled={isProcessing}
              />
              <img
                src={method.logo}
                alt={method.label}
                className="w-8 h-8 object-contain"
              />
              <span className="text-sm">{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[350px] border rounded p-4 bg-white">
        <div className="text-sm text-orange-600 font-semibold mb-2">
          Thời gian giữ ghế: {formatTimeLeft(timeLeft)}
        </div>

        <div className="flex gap-4 mb-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/vi/7/7e/Lilo_%26_Stitch_poster.jpg"
            alt="poster"
            className="w-20 h-28 object-cover rounded"
          />
          <div>
            <h3 className="font-semibold">{movieTitle || "Đang tải..."}</h3>
            <p className="text-sm">2D Lồng Tiếng</p>
          </div>
        </div>

        <p className="text-sm text-gray-700">{cinemaName || "Galaxy Cinema"}</p>
        <p className="text-sm">
          Suất: <strong>{formattedTime || "19:30"}</strong> - {formattedDate || "23/05/2025"}
        </p>

        <hr className="my-4" />

        <div className="text-sm text-gray-800 mb-1">
          <strong>{selectedSeats?.length || 0}x</strong> Người lớn - Member<br />
          Ghế: <strong>{selectedSeats?.join(', ') || "Chưa chọn ghế"}</strong>
        </div>
        
        {renderSelectedServices()}

        <hr className="my-4" />

        {/* Hiển thị chi tiết giá */}
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Tiền vé:</span>
            <span>{bookingTotal?.toLocaleString('vi-VN') || '0'} ₫</span>
          </div>
          {serviceTotal > 0 && (
            <div className="flex justify-between">
              <span>Combo:</span>
              <span>{serviceTotal.toLocaleString('vi-VN')} ₫</span>
            </div>
          )}
        </div>

        <div className="flex justify-between font-semibold mt-4 text-base border-t pt-2">
          <span>Tổng cộng</span>
          <span className="text-orange-500">{finalTotal?.toLocaleString('vi-VN') || '0'} ₫</span>
        </div>
        
        <button 
          onClick={handlePayment}
          disabled={isProcessing || timeLeft <= 0}
          className="mt-6 w-full bg-orange-500 text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
        </button>

        {/* Nút quay lại */}
        <button 
          onClick={() => navigate('/food')}
          disabled={isProcessing}
          className="mt-2 w-full border border-orange-500 text-orange-500 py-2 rounded disabled:opacity-50"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;