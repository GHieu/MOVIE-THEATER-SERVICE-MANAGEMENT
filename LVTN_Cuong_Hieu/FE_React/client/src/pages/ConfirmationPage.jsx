import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Barcode from 'react-barcode';
export default function ConfirmationPage() {
  const location = useLocation();

  // Lấy query parameters từ URL
  const queryParams = new URLSearchParams(location.search);

  // DEBUG: Log tất cả thông tin
  console.log("=== CONFIRMATION PAGE DEBUG ===");
  console.log("location.search:", location.search);
  console.log("queryParams:", Object.fromEntries(queryParams));
  console.log("sessionStorage confirmationData:", sessionStorage.getItem("confirmationData"));
  console.log("sessionStorage bookingData:", sessionStorage.getItem("bookingData"));

  // Ưu tiên lấy dữ liệu từ query parameters, sau đó fallback về sessionStorage
  let bookingData = {};

  // Lấy từ query parameters
  if (queryParams.get('ticket_id')) {
    bookingData = {
      ticketId: queryParams.get('ticket_id'),
      movieTitle: queryParams.get('movie_title'),
      cinemaName: queryParams.get('cinema_name') || 'AbsoluteCinema',
      formattedDate: queryParams.get('formatted_date'),
      formattedTime: queryParams.get('formatted_time'),
      selectedSeats: queryParams.get('selected_seats') ? JSON.parse(queryParams.get('selected_seats')) : [],
      finalTotal: parseFloat(queryParams.get('final_total')) || 0,
      paymentMethod: queryParams.get('payment_method') || 'vnpay',
      paymentStatus: queryParams.get('payment_status') || 'completed',
      voucher: queryParams.get('voucher') || null,
      services: queryParams.get('services') ? JSON.parse(queryParams.get('services')) : {},
      servicesList: queryParams.get('services_list') ? JSON.parse(queryParams.get('services_list')) : [],
      error: queryParams.get('error') || null
    };
    console.log("Using query parameters for bookingData");
  } else if (sessionStorage.getItem("confirmationData")) {
    try {
      bookingData = JSON.parse(sessionStorage.getItem("confirmationData"));
      console.log("Using confirmationData from sessionStorage");
    } catch (error) {
      console.error("Error parsing confirmationData:", error);
    }
  } else if (sessionStorage.getItem("bookingData")) {
    try {
      bookingData = JSON.parse(sessionStorage.getItem("bookingData"));
      console.log("Using bookingData from sessionStorage (fallback)");
    } catch (error) {
      console.error("Error parsing bookingData:", error);
    }
  }

  // DEBUG: Log dữ liệu cuối cùng
  console.log("Final bookingData:", bookingData);
  console.log("All keys in bookingData:", Object.keys(bookingData));

  useEffect(() => {
    // DEBUG: Log trước khi xóa
    console.log("=== CLEANUP SESSION STORAGE ===");
    
    // Xóa sessionStorage để tránh dữ liệu cũ
    if (sessionStorage.getItem("confirmationData")) {
      console.log("Removing confirmationData...");
      sessionStorage.removeItem("confirmationData");
    }
    
    if (sessionStorage.getItem("bookingData")) {
      console.log("Removing bookingData...");
      sessionStorage.removeItem("bookingData");
    }
    
    sessionStorage.removeItem("pendingTicketId");
    sessionStorage.removeItem("pendingBookingData");
    sessionStorage.removeItem("seatHoldStartTime");
    sessionStorage.removeItem("lastBookingInfo");
    
    console.log("Session storage cleaned up");
  }, []);

  const {
    ticketId,
    movieTitle,
    cinemaName,
    formattedDate,
    formattedTime,
    selectedSeats,
    finalTotal,
    voucher,
    services = {},
    servicesList = [],
    paymentMethod,
    paymentStatus,
    error
  } = bookingData;

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">❌</div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                Thanh toán thất bại
              </h1>
              <p className="text-gray-600">{error}</p>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => window.location.href = "/homepage"}
              >
                Về trang chủ
              </button>
              <button
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                onClick={() => window.location.href = "/movies"}
              >
                Đặt vé lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tạo text hiển thị combo
  const comboText = servicesList.length > 0
    ? servicesList
        .filter(item => services[item.id])
        .map(item => `${item.name} x${services[item.id].quantity}`)
        .join(", ")
    : "Không có";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🎉</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600">
              Cảm ơn bạn đã đặt vé tại   <p className="text-amber-600 text-xl">AbsoluteCinema</p>
            </p>
            
            {ticketId && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Mã vé:</strong> {ticketId}
                </p>
                {paymentMethod && (
                  <p className="text-sm text-green-700">
                    <strong>Phương thức:</strong> {paymentMethod.toUpperCase()}
                  </p>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">📦 Mã vạch vé</p>
                  <div className="flex justify-center">
                    <Barcode value={`TICKET-${ticketId}`} height={60} />
                  </div>
                </div>
                <p className="text-sm text-red-500">
                    <strong>VUI LÒNG CHỤP LẠI ĐỂ XÁC NHẬN VÉ TẠI QUẦY</strong> 
                  </p>
              </div>
              
            )}
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="mb-2">
                  <strong>🎬 Phim:</strong> {movieTitle || "Không có thông tin"}
                </p>
                <p className="mb-2">
                  <strong>📍 Rạp:</strong> {cinemaName || "AbsoluteCinema"}
                </p>
                <p className="mb-2">
                  <strong>🕒 Suất:</strong> {formattedTime || "N/A"} - {formattedDate || "N/A"}
                </p>
              </div>
              
              <div>
                <p className="mb-2">
                  <strong>🪑 Ghế:</strong> {selectedSeats?.join(', ') || "Không có"}
                </p>
                <p className="mb-2">
                  <strong>👥 Số lượng:</strong> {selectedSeats?.length || 0} vé
                </p>
                <p className="mb-2">
                  <strong>💳 Thanh toán:</strong> {paymentMethod ? paymentMethod.toUpperCase() : "VNPay"}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="mb-2">
                <strong>🍿 Combo:</strong> {comboText}
              </p>
              <p className="mb-2">
                <strong>🎁 Mã khuyến mãi:</strong> {voucher || "Không có"}
              </p>
            </div>
            
            <div className="text-xl font-bold text-center py-4 bg-green-50 rounded-lg">
              <strong>💰 Tổng cộng:</strong> {finalTotal?.toLocaleString('vi-VN') || "0"} đ
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => window.location.href = "/homepage"}
            >
              Về trang chủ
            </button>
            
            <button
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
              onClick={() => window.location.href = "/profile?tab=ticketManagement"}
            >
              Xem vé của tôi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}