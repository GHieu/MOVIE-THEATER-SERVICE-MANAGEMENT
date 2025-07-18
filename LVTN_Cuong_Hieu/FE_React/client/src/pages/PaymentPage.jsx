// ✅ FIXED: Frontend PaymentPage.jsx - Simplified VNPay handling

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BookingSidebar from "../components/BookingSidebar";
import useCountdownTimer from "../hooks/useCountdownTimer";
import CountdownTimer from "../components/FoodPageBooking/CountdownTimer";
import useBooking2 from "../hooks/useBookingSucces";
import LoadingOverlay from "../components/LoadingOverlay";
import { useMembership } from "../contexts/MembershipContext";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProcessingRef = useRef(false);
  const { refetchMembership } = useMembership();
  
  const [bookingData, setBookingData] = useState(() => {
    return location.state || JSON.parse(sessionStorage.getItem("bookingData")) || {};
  });

  const [promotionInput, setPromotionInput] = useState(bookingData.promotionId || "");
  const [selectedMethod, setSelectedMethod] = useState("vnpay");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { movieId, rawDate, rawTime } = bookingData;

  // ✅ REMOVED: VNPay callback handling - BE sẽ handle và redirect
  // Không cần xử lý callback ở đây nữa

  const handleTimeExpired = () => {
    if (isProcessingRef.current) {
      console.log("Timer hết giờ nhưng đang xử lý thanh toán, không redirect");
      return;
    }

    alert("Thời gian giữ ghế đã hết. Vui lòng đặt vé lại.");
    
    // Clean up
    sessionStorage.removeItem("bookingData");
    sessionStorage.removeItem("seatHoldStartTime");
    sessionStorage.removeItem("lastBookingInfo");

    navigate(`/booking/${movieId}?date=${rawDate}&time=${rawTime}`);
  };

  // Timer logic
  const MAX_HOLD_TIME = 3 * 60;
  const seatHoldStartTime = parseInt(sessionStorage.getItem("seatHoldStartTime"), 10);
  const now = Date.now();
  const elapsed = Math.floor((now - seatHoldStartTime) / 1000);
  const remainingTime = Math.max(0, MAX_HOLD_TIME - elapsed);

  const { timeLeft: countdownTimeLeft, isExpired } = useCountdownTimer(
    remainingTime,
    handleTimeExpired,
    [bookingData?.showtimeId, bookingData?.selectedSeats],
    isProcessing
  );

  // Validation effect
  useEffect(() => {
    if (isProcessing) return;
    
    if (
      !bookingData.movieTitle ||
      !bookingData.selectedSeats ||
      bookingData.selectedSeats.length === 0 ||
      countdownTimeLeft <= 0
    ) {
      navigate("/movies");
    }
  }, [bookingData, countdownTimeLeft, navigate, isProcessing]);

  const {
    createBooking,
    bookingData: createdBooking,
    error: bookingError,
    loading: bookingLoading
  } = useBooking2();

  const handleApplyPromotion = () => {
    const updated = {
      ...bookingData,
      promotionId: promotionInput || null,
    };
    setBookingData(updated);
    sessionStorage.setItem("bookingData", JSON.stringify(updated));
    alert("Đã áp dụng mã khuyến mãi!");
  };

  // ✅ SIMPLIFIED: Payment handler
  const handlePayment = async () => {
    if (isProcessing || isExpired) return;

    setIsProcessing(true);

    try {
      const validServices = Object.entries(bookingData.services || {})
        .filter(([_, quantity]) => quantity > 0 && Number.isInteger(Number(quantity)))
        .map(([service_id, quantity]) => ({
          service_id: parseInt(service_id),
          quantity: parseInt(quantity),
        }));

      const bookingInfo = {
        showtime_id: bookingData.showtimeId,
        seats: bookingData.selectedSeats,
        services: validServices.length > 0 ? validServices : [],
        promotion_id: promotionInput || null,
        payment_method: selectedMethod,
      };

      const result = await createBooking(bookingInfo);

      if (selectedMethod === 'vnpay' && result.payment_url) {
        // ✅ SIMPLIFIED: Chỉ cần redirect đến VNPay
        // BE sẽ handle callback và redirect về FE
        
        console.log("Redirecting to VNPay:", result.payment_url);
        alert(result.message || "Đang chuyển đến trang thanh toán VNPay...");
        
        // ✅ IMPORTANT: Clean up trước khi redirect
        sessionStorage.removeItem("bookingData");
        sessionStorage.removeItem("seatHoldStartTime");
        sessionStorage.removeItem("lastBookingInfo");
        
        // Redirect to VNPay
        window.location.href = result.payment_url;
        return;
      } 
      // Handle other payment methods
      else if (result.ticket_id) {
        // Direct payment success
        const confirmationData = {
          ...bookingData,
          ticketId: result.ticket_id,
          finalTotal: result.total,
          paymentMethod: selectedMethod,
          paymentStatus: 'completed',
        };

        sessionStorage.removeItem("bookingData");
        sessionStorage.removeItem("seatHoldStartTime");
        sessionStorage.removeItem("lastBookingInfo");

        navigate("/order-success", {
          state: confirmationData,
          replace: true,
        });

        refetchMembership();
      } else {
        throw new Error("Invalid payment response");
      }

    } catch (err) {
      console.error("Payment error:", err);
      alert("Đặt vé thất bại. Vui lòng thử lại!");
      setIsProcessing(false);
    }
  };

  // ✅ SIMPLIFIED: Render without complex debug
  return (
    <>
      {isProcessing && <LoadingOverlay message="Đang xử lý thanh toán..." />}
      
      <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {/* Promotion section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Khuyến mãi</h2>
            <div className="flex gap-2 mb-1">
              <input
                type="text"
                value={promotionInput}
                onChange={(e) => setPromotionInput(e.target.value)}
                placeholder="Nhập ID khuyến mãi"
                className="border p-2 rounded w-full"
                disabled={isProcessing}
              />
              <button
                type="button"
                onClick={handleApplyPromotion}
                className="bg-orange-500 text-white px-4 rounded disabled:opacity-50"
                disabled={isProcessing}
              >
                Áp Dụng
              </button>
            </div>
          </div>

          {/* Payment methods */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Phương thức thanh toán</h2>
            <label className="flex items-center gap-3 p-3 border rounded mb-3 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                checked={selectedMethod === "vnpay"}
                onChange={() => setSelectedMethod("vnpay")}
                disabled={isProcessing}
              />
              <img 
                src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" 
                alt="VNPay" 
                className="w-8 h-8 object-contain" 
              />
              <span className="text-sm">VNPay</span>
            </label>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {!isProcessing && <CountdownTimer timeLeft={countdownTimeLeft} />}

          <BookingSidebar
            poster={bookingData.poster}
            movieTitle={bookingData.movieTitle}
            age={bookingData.age}
            roomName={bookingData.roomName}
            roomType={bookingData.roomType}
            formattedTime={bookingData.formattedTime}
            formattedDate={bookingData.formattedDate}
            selectedSeats={bookingData.selectedSeats}
            bookingTotal={bookingData.bookingTotal}
            services={bookingData.servicesList || []}
            selectedServices={bookingData.services || {}}
            serviceTotal={bookingData.serviceTotal}
            finalTotal={bookingData.finalTotal}
            isExpired={isExpired}
            onGoBack={() => navigate("/food")}
            onContinue={handlePayment}
            buttonLabel="Thanh toán"
            disabled={isProcessing || bookingLoading}
          />
        </div>
      </div>
    </>
  );
};

export default PaymentPage;