// hooks/useClearBookingState.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useClearBookingState = () => {
  const location = useLocation();

  useEffect(() => {
    const allowedPaths = ["/booking", "/food", "/payment"];

    const isBookingFlow = allowedPaths.some((path) =>
      location.pathname.startsWith(path)
    );

    if (!isBookingFlow) {
      // 🧹 Xoá khi rời luồng đặt vé
      sessionStorage.removeItem("bookingState");
      sessionStorage.removeItem("seatHoldStartTime");
      sessionStorage.removeItem("lastBookingInfo");
      sessionStorage.removeItem("bookingData"); // ✅ thêm: thông tin tổng booking
      sessionStorage.removeItem("selectedServices"); // ✅ nếu có key lưu riêng dịch vụ
    }
  }, [location.pathname]);
};

export default useClearBookingState;
