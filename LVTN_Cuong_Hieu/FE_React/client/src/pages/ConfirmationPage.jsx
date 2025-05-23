import React from "react";
import { Link } from "react-router-dom";
export default function ConfirmationPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-600">🎉 Thanh toán thành công!</h1>
        <p className="text-gray-600 mt-2">Cảm ơn bạn đã đặt vé tại Galaxy Cinema</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>🎬 Phim:</strong> Lilo & Stitch</p>
            <p><strong>📍 Rạp:</strong> Galaxy Long Xuyên</p>
            <p><strong>🕒 Suất:</strong> 13:00 - 23/05/2025</p>
          </div>
          <div>
            <p><strong>🪑 Ghế:</strong> E5, E6</p>
            <p><strong>👥 Số lượng:</strong> 2 vé</p>
            <p><strong>💳 Thanh toán:</strong> OnePay (Visa)</p>
          </div>
        </div>

        <div className="mt-4">
          <p><strong>🍿 Combo:</strong> 1x Capybara Set</p>
          <p><strong>💰 Tổng cộng:</strong> <span className="text-orange-500 font-bold">490.000 đ</span></p>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-4">
      <Link to="/homepage">
           <button  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Về trang chủ</button>
      </Link>
       
        <a href="/tickets" className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100">Xem vé của tôi</a>
      </div>
    </div>
  );
}
